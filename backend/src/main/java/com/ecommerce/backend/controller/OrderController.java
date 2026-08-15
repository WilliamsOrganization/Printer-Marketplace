package com.ecommerce.backend.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.dto.CheckoutSummary;
import com.ecommerce.backend.dto.OrderResponse;
import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.exception.UserNotFoundException;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.service.StripeCatalogService;
import com.ecommerce.backend.service.UserService;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * OrderController handles all requests related to placing orders.
 */
@RestController
@RequestMapping("/server/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
	private final UserService userService;
	private final StripeCatalogService stripeCatalogService;
	private final OrderRepository orderRepository;

	/**
	 * Get orders for the current user.
	 * 
	 * @return
	 */
	@GetMapping("/{orderId}")
	public OrderResponse getSingleOrder(@PathVariable String orderId) throws StripeException {
		Users user = userService.getUserFromSession();
		Orders order = orderRepository.findOrderByStripeSessionId(orderId).orElseThrow();
		if (!order.getUser().getId().equals(user.getId())) {
			throw new UserNotFoundException("User not found");
		}
		Session session = stripeCatalogService.getCheckoutSession(order.getStripeSessionId());
		return new OrderResponse(order, toCheckoutSummary(session));
	}

	/**
	 * Get orders for the current user.
	 *
	 * @return
	 */
	@GetMapping("/")
	public ArrayList<OrderResponse> getAllUserOrders() throws StripeException {
		Users user = userService.getUserFromSession();
		log.info("USER ID HERE FOR THE ORDERS userid: {}", user.getId());
		List<Orders> order = orderRepository.findByUser(user).orElseThrow();
		ArrayList<OrderResponse> OrderResponse = new ArrayList<>();
		for (Orders Orders : order) {
			Session session = stripeCatalogService.getCheckoutSession(Orders.getStripeSessionId());
			OrderResponse.add(new OrderResponse(Orders, toCheckoutSummary(session)));
		}
		return OrderResponse;
	}

	/**
	 * Get every order in the system, for the admin dashboard.
	 *
	 * @return all orders
	 */
	@GetMapping("/admin/all")
	@PreAuthorize("hasRole('ADMIN')")
	public List<Orders> getAllOrders() {
		return orderRepository.findAll();
	}

	/**
	 * Reduces a Stripe checkout Session down to the fields the frontend
	 * needs, since the raw Session isn't Jackson-serializable (it carries
	 * internal SDK types like LiveStripeResponseGetter).
	 *
	 * @param session the Stripe checkout session
	 * @return the summarized fields
	 */
	private static CheckoutSummary toCheckoutSummary(Session session) {
		String customerEmail = session.getCustomerDetails() != null
				? session.getCustomerDetails().getEmail()
				: null;
		return new CheckoutSummary(
				session.getStatus(),
				customerEmail,
				session.getAmountTotal(),
				session.getCurrency());
	}
}
