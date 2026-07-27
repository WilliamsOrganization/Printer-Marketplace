package com.ecommerce.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.CreateCatalogRequest;
import com.ecommerce.backend.dto.CreateCatalogResponse;
import com.ecommerce.backend.dto.EditCatalogRequest;
import com.ecommerce.backend.dto.ShippingQuote;
import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.entity.InventoryItem;
import com.goshippo.shippo_sdk.models.operations.GetRateResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.Price;
import com.stripe.model.Product;
import com.stripe.model.ProductCollection;
import com.stripe.model.checkout.Session;
import com.stripe.param.PriceCreateParams;
import com.stripe.param.PriceUpdateParams;
import com.stripe.param.ProductCreateParams;
import com.stripe.param.ProductListParams;
import com.stripe.param.ProductUpdateParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.checkout.SessionCreateParams.LineItem;
import com.stripe.param.checkout.SessionCreateParams.ShippingOption.ShippingRateData;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Manages Stripe product/price catalog entries and builds checkout sessions
 * for the cart.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StripeCatalogService {
	private static final String SUCCESS_URL = "http://www.localhost:3000/success?session_id={CHECKOUT_SESSION_ID}";
	private static final String CANCEL_URL = "http://www.localhost:3000/";
	/**
	 * This method is used to map the cart items to line items.
	 * 
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 */
	public static List<LineItem> mapCartItemstoLineItems(Cart cart){
		List<LineItem> lineItems = new ArrayList<>();
		List<CartItem> cartItems = cart.getItems();
		for (CartItem cartItem : cartItems) {
			Long quantity = Long.valueOf(cartItem.getQuantity());
			InventoryItem item = cartItem.getItem();
			LineItem lineItem = LineItem.builder()
					.setPrice(item.getStripePriceId())
					.setQuantity(quantity)
					.build();
			lineItems.add(lineItem);
		}
		return lineItems;
	}
	/**
	 * Extracts the display name, price in cents, and currency from a Shippo
	 * rate quote.
	 *
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 */
	private static ShippingQuote toShippingQuote(GetRateResponse rate) {
		String name = rate.rate().get().servicelevel().name().get();
		BigDecimal dollars = new BigDecimal(rate.rate().get().amount());
		Long amountInCents = dollars.movePointRight(2)
				.setScale(0, RoundingMode.HALF_UP)
				.longValueExact();
		String currency = rate.rate().get().currency().toLowerCase();
		return new ShippingQuote(name, amountInCents, currency);
	}

	private final CartService cartService;

	private final ShippoService shippoService;

	/**
	 * Creates a new Product item with a single Price.
	 *
	 * @param request the request
	 * @return the response
	 */
	public CreateCatalogResponse createProductAndPrice(CreateCatalogRequest req)
			throws StripeException {
		ProductCreateParams productCreateParams = ProductCreateParams.builder()
				.setName(req.getName())
				.setDescription(req.getDescription())
				.addAllImage(req.getImageUrls())
				.putMetadata("source", "springboot")
				.putMetadata("stock_qty_snapshot",
						String.valueOf(req.getQuantity()))
				.build();
		Product product = Product.create(productCreateParams);

		PriceCreateParams priceCreateParams = PriceCreateParams.builder()
				.setProduct(product.getId())
				.setUnitAmount(req.getUnitAmount() * 100)
				.setCurrency(req.getCurrency().toLowerCase())
				.build();

		Price price = Price.create(priceCreateParams);

		return new CreateCatalogResponse(
				product.getId(), price.getId(), product.getName(),
				price.getUnitAmount(), price.getCurrency());
	}

	/**
	 * Deletes a Stripe product, falling back to archiving it (setting
	 * active=false) if Stripe refuses the delete because the product still
	 * has associated prices/usage.
	 *
	 * @param id the Stripe product id
	 * @return true if the product was deleted, false if it was archived instead
	 */
	public boolean deleteProduct(String id) throws StripeException {
		Product resource = Product.retrieve(id);
		try {
			resource.delete();
			return true;
		} catch (StripeException e) {
			log.warn("Could not delete product {}, archiving instead: {}", id,
					e.getMessage());
			resource.update(
					ProductUpdateParams.builder().setActive(false).build());
			return false;
		}
	}

	/**
	 * This method is used to activate a product that has been archived.
	 * 
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 */
	public void activateProduct(String id) throws StripeException {
		Product resource = Product.retrieve(id);
		resource.update(ProductUpdateParams.builder().setActive(true).build());
	}

	/**
	 * Updates a Stripe product's name/description/images, and if a new unit
	 * amount is given, creates a new Price, sets it as the product's default,
	 * and deactivates the old one.
	 *
	 * @param id  the Stripe product id
	 * @param req the fields to update; null fields are left unchanged
	 * @return the updated product
	 */
	public Product editProduct(String id, EditCatalogRequest req)
			throws StripeException {
		Product resource = Product.retrieve(id);

		ProductUpdateParams.Builder updateBuilder = ProductUpdateParams.builder();
		if (req.getName() != null)
			updateBuilder.setName(req.getName());
		if (req.getDescription() != null)
			updateBuilder.setDescription(req.getDescription());
		if (req.getImageUrls() != null)
			updateBuilder.addAllImage(req.getImageUrls());

		if (req.getUnitAmount() != null) {
			String oldPriceId = resource.getDefaultPrice();
			String currency = req.getCurrency() != null
					? req.getCurrency().toLowerCase()
					: "cad";
			Price newPrice = Price.create(PriceCreateParams.builder()
					.setProduct(id)
					.setUnitAmount(req.getUnitAmount() * 100)
					.setCurrency(currency)
					.build());
			updateBuilder.setDefaultPrice(newPrice.getId());

			if (oldPriceId != null) {
				Price.retrieve(oldPriceId)
						.update(
								PriceUpdateParams.builder().setActive(false).build());
			}
		}

		return resource.update(updateBuilder.build());
	}

	/**
	 * creates a checkout session with the selected shipping rate attached to
	 * it.
	 * 
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 */
	public String createCheckoutSession(String selectedShippingID)
			throws Exception {
		Cart cart = cartService.getCartItems();
		List<LineItem> lineItems = mapCartItemstoLineItems(cart);
		// get quoted price from shippo service.
		GetRateResponse rate = shippoService.getShipmentRateById(selectedShippingID);
		ShippingQuote quote = toShippingQuote(rate);

		SessionCreateParams params = SessionCreateParams.builder()
				.setSuccessUrl(SUCCESS_URL)
				.setCancelUrl(CANCEL_URL)
				.addAllLineItem(lineItems)
				.addShippingOption(SessionCreateParams.ShippingOption.builder()
						.setShippingRateData(ShippingRateData.builder()
								.setDisplayName(quote.name())
								.setType(ShippingRateData.Type.FIXED_AMOUNT)
								.setFixedAmount(ShippingRateData.FixedAmount.builder()
										.setAmount(quote.amountInCents())
										.setCurrency(quote.currency())
										.build())
								.build())
						.build())
				.setMode(SessionCreateParams.Mode.PAYMENT)
				.build();
		Session session = Session.create(params, null);
		return session.getUrl();
	}
	
	/**
	 * This is intended for managing seed data.
	 *
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 * @return a list of ids that can be used to populate seed data.
	 */
	public ProductCollection getAllProducts() throws StripeException {
		ProductListParams productListParams = ProductListParams.builder().setLimit(100L).build();
		return Product.list(productListParams);
	}
	
	/**
	 * This is the webhook endpoint for stripe checkout events. 
	 * 
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 */
	public void handleSuccessfulCheckoutEvent(String payload) {
		// TODO: handle successful checkout event
		// TODO: register ShippingRate with shippo maybe preallocate then link after with order
		// TODO: Create and ORder Object with shipping id
		// TODO: Get shipping Label from Shippo. 
	}
}
