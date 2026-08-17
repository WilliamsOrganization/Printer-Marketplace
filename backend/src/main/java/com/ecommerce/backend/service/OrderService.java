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
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.exception.OrderNotFoundException;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ShippingRepository;
import com.goshippo.shippo_sdk.models.components.Shipment;
import com.stripe.model.checkout.Session;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * OrderService
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {
	private static final Long DOLLAR = 100L;

	private final OrderRepository orderRepository;
	private final ShippingRepository shippingRepository;
	private final UserService userService;
	private final ResendService resendService;
	private final GoogleMapsService googleMapsService;

	/**
	 * Create a new pending order (and its shipping record) from the cart
	 * being checked out, the Stripe checkout session just created for it, and
	 * the Shippo shipment/quote backing the rate the customer selected.
	 *
	 * @param session         the created Stripe checkout session
	 * @param shipment        the Shippo shipment backing the selected rate, for
	 *                        its origin/destination addresses
	 * @param quote           the selected rate's price/service level info
	 * @param cart            the cart being checked out
	 * @param selectedRateId  the Shippo rate object id the customer's quote is
	 *                        locked in at - stored so the label can be
	 *                        purchased at this same rate once payment confirms
	 * @return the persisted order, marked as pending
	 */
	public Orders createPendingOrder(Session session, Shipment shipment, ShippingQuote quote, Cart cart,
			String selectedRateId) {
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

		ShippingAddress addressTo = ShippingAddress.from(shipment.addressTo());
		var location = googleMapsService.geocode(addressTo);
		Shipping shipping = Shipping.builder()
				.orders(order)
				.serviceType(quote.name())
				.addressFrom(ShippingAddress.from(shipment.addressFrom()))
				.addressTo(addressTo)
				.lat(location != null ? location.lat : null)
				.lng(location != null ? location.lng : null)
				.shippoRateId(selectedRateId)
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
		return orderRepository.findOrderByStripeSessionId(id).orElseThrow();
	}

	/**
	 * Gets an order by its id.
	 *
	 * @param id the order's id
	 * @return the order
	 */
	public Orders getOrder(Long id) {
		return orderRepository.findById(id).orElseThrow();
	}

	/**
	 * Gets an order by its User and Id.
	 *
	 * @param user the user
	 * @param id the order's id
	 * @return the order
	 */
	public Orders getOrderByUserAndId(Users user, Long id) {
		return orderRepository.findByUserAndId(user, id)
				.orElseThrow(() -> new OrderNotFoundException("Order not found"));
	}

	/**
	 * Applies a completed Stripe checkout session to its pending order -
	 * marking it PAID or COMPLETED depending on whether Stripe reports the
	 * session as already paid, and syncing the payment fields Stripe now
	 * knows. No-ops (returns null) if the order isn't still PENDING, since
	 * webhook events can be delivered more than once.
	 *
	 * @param session the completed Stripe checkout session
	 * @return the updated order, or null if there was nothing to apply
	 */
	public void applyCompletedCheckout(Session session) {
		Orders order = getOrderByStripeSessionId(session.getId());
		if (order.getStatus() == Orders.Status.COMPLETED || order.getStatus() != Orders.Status.PENDING) {
			log.info("Skipping completed order {}", order.getId());
		}
		if ("paid".equals(session.getPaymentStatus())) {
			order.setStatus(Orders.Status.PAID);
		} else {
			order.setStatus(Orders.Status.COMPLETED);
		}
		order.setStripeEmail(session.getCustomerEmail());
		order.setCurrency(session.getCurrency());
		order.setSubtotal(session.getAmountSubtotal());
		order.setTotal(session.getAmountTotal());
		order.setCardholderName(session.getCustomerDetails() != null ? session.getCustomerDetails().getName() : null);
		Users user=userService.registerUser(order.getUser());
		if (session.getShippingCost() != null) {
			order.setShippingCost(session.getShippingCost().getAmountTotal());
		}

		log.info("Order Status Updated to {}", order.getStatus());
		resendService.sendConfirmationEmail(user, order);
		log.info("Email sent to this email: {}", user.getEmail());
	}

	/**
	 * Applies an expired Stripe checkout session to its pending order.
	 * No-ops if the order isn't still PENDING.
	 *
	 * @param stripeSessionId the expired Stripe checkout session's id
	 */
	public void applyExpiredCheckout(String stripeSessionId) {
		Orders order = getOrderByStripeSessionId(stripeSessionId);
		if (order.getStatus() == Orders.Status.EXPIRED || order.getStatus() != Orders.Status.PENDING) {
			log.info("Order status was skipped due to invalid status {} order id: {}", order.getStatus(), order.getId());
			return;
		}
		order.setStatus(Orders.Status.EXPIRED);
		orderRepository.save(order);
		userService.registerUser(order.getUser());
		log.info("Order Status Updated to {}", order.getStatus());
	}

	/**
	 * Applies a failed Stripe checkout session to its completed order, and
	 * demotes the buyer back to a plain registered account (unless they're an
	 * admin) since the payment behind their most recent order didn't go
	 * through. No-ops if the order isn't COMPLETED.
	 *
	 * @param stripeSessionId the failed Stripe checkout session's id
	 */
	public void applyFailedCheckout(String stripeSessionId) {
		Orders order = getOrderByStripeSessionId(stripeSessionId);
		if (order.getStatus() != Orders.Status.COMPLETED) {
			log.info("Order status was skipped due to invalid status {} order id: {}", order.getStatus(), order.getId());
			return;
		}
		order.setStatus(Orders.Status.FAILED);
		order = orderRepository.save(order);
		userService.registerUser(order.getUser());
		log.info("Order Status Updated to {}", order.getStatus());
	}

	/**
	 * Applies a successful Stripe checkout session to its completed order.
	 * No-ops if the order isn't COMPLETED.
	 *
	 * @param stripeSessionId the successful Stripe checkout session's id
	 */
	public void applySuccessfulCheckout(Session session) {
		Orders order = getOrderByStripeSessionId(session.getId());
		String customerName = session.getCustomerDetails() != null ? session.getCustomerDetails().getName() : null;

		if (order.getStatus() != Orders.Status.COMPLETED) {
			log.info("Order status was skipped due to invalid status {} order id: {}", order.getStatus(), order.getId());
			return;
		}
		order.setStatus(Orders.Status.PAID);
		order.setCardholderName(customerName);
		log.info("Cardholder name set to {}", customerName);
		orderRepository.save(order);
		userService.registerUser(order.getUser());
		log.info("Order Status Updated to {}", order.getStatus());
	}
}
