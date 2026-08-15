package com.ecommerce.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.ShippingQuote;
import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.entity.OrderItem;
import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Shipping;
import com.ecommerce.backend.entity.ShippingAddress;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ShippingRepository;
import com.goshippo.shippo_sdk.models.components.Shipment;
import com.stripe.model.checkout.Session;

import lombok.RequiredArgsConstructor;

/**
 * OrderService
 */
@Service
@RequiredArgsConstructor
public class OrderService {
	private static final Long DOLLAR = 100L;

	private final OrderRepository orderRepository;
	private final ShippingRepository shippingRepository;

	/**
	 * Create a new pending order (and its shipping record) from the cart
	 * being checked out, the Stripe checkout session just created for it, and
	 * the Shippo shipment/quote backing the rate the customer selected.
	 *
	 * @param session  the created Stripe checkout session
	 * @param shipment the Shippo shipment backing the selected rate, for its
	 *                 origin/destination addresses
	 * @param quote    the selected rate's price/service level info
	 * @param cart     the cart being checked out
	 * @return the persisted order, marked as pending
	 */
	public Orders createPendingOrder(Session session, Shipment shipment, ShippingQuote quote, Cart cart) {
		Orders order = Orders.builder()
				.user(cart.getUser())
				.stripeSessionId(session.getId())
				.email(cart.getUser().getEmail())
				.currency(quote.currency())
				.status(Orders.Status.PENDING)
				.build();

		Long subtotal = 0L;
		List<OrderItem> orderItems = new ArrayList<>();
		for (CartItem cartItem : cart.getItems()) {
			InventoryItem item = cartItem.getItem();
			Long unitPrice = item.getItemCost() * DOLLAR;
			subtotal += unitPrice * cartItem.getQuantity();
			orderItems.add(OrderItem.builder()
					.orders(order)
					.item(item)
					.quantity(cartItem.getQuantity())
					.itemTitle(item.getItemTitle())
					.unitPrice(unitPrice)
					.build());
		}

		Long shippingCost = quote.amountInCents();
		order.setItems(orderItems);
		order.setSubtotal(subtotal);
		order.setShippingCost(shippingCost);
		order.setTotal(subtotal + shippingCost);
		order = orderRepository.save(order);

		Shipping shipping = Shipping.builder()
				.orders(order)
				.shippingCost(shippingCost)
				.serviceType(quote.name())
				.addressFrom(ShippingAddress.from(shipment.addressFrom()))
				.addressTo(ShippingAddress.from(shipment.addressTo()))
				.status(Shipping.Status.PENDING)
				.build();
		order.setShipping(shippingRepository.save(shipping));

		return order;
	}

	/**
	 * Gets an order by its Stripe session id.
	 *
	 * @param id the Stripe session id
	 * @return the order, or null if not found
	 */	
	public Orders getOrderByStripeSessionId(String id) {
		return orderRepository.findOrderByStripeSessionId(id).orElse(null);
	}
}
