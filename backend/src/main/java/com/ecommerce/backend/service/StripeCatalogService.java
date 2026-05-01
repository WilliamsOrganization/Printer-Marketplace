package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.CreateCatalogRequest;
import com.ecommerce.backend.dto.CreateCatalogResponse;
import com.ecommerce.backend.dto.EditCatalogRequest;
import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.repository.InventoryItemRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Price;
import com.stripe.model.Product;
import com.stripe.param.PriceCreateParams;
import com.stripe.param.PriceUpdateParams;
import com.stripe.param.ProductCreateParams;
import com.stripe.param.ProductUpdateParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.service.checkout.SessionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * StripeCatalogService
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StripeCatalogService {
	private final InventoryItemRepository inventoryItemRepository;
	@Value("{${environment.url}}")
	private String rootUrl;

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

	// returns true if deleted, false if archived
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
				Price.retrieve(oldPriceId).update(
						PriceUpdateParams.builder().setActive(false).build());
			}
		}

		return resource.update(updateBuilder.build());
	}

	// TODO: checkout form return type takes in lineItems returns stripe checkout url
	// public String checkout() {
	// 	String url = rootUrl + "/success?session_id={CHECKOUT_SESSION_ID}";
	// 	SessionCreateParams params = SessionCreateParams.builder().setMode(SessionCreateParams.Mode.PAYMENT)
	// 	.setSuccessUrl(url)
	// 		.addLineItem(SessionCreateParams.LineItem.builder()
	// 	.setPrice(price)
	// 	)
	//
	//
	//
	//
	// }
	
}
