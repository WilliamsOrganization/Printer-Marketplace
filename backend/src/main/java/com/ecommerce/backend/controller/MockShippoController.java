package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Shipping;
import com.ecommerce.backend.service.MockShippoService;
import com.ecommerce.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Test-only endpoints for exercising Shippo tracking locally, without
 * waiting on a real carrier or standing up a tunnel for Shippo to actually
 * reach this app - see MockShippoService.
 */
@Slf4j
@RestController
@RequestMapping("/server/mock-shippo")
@RequiredArgsConstructor
public class MockShippoController {
	private final MockShippoService mockShippoService;
	private final OrderService orderService;

	/**
	 * Advances an order's shipment one step through the PRE_TRANSIT ->
	 * TRANSIT -> DELIVERED cycle by calling the real
	 * /server/shipping/webhook endpoint with a synthetic payload built from
	 * the shipment's real tracking number.
	 *
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 */
	@PostMapping("/{orderId}/advance")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Shipping> advanceTracking(@PathVariable Long orderId) throws Exception {
		Orders order = orderService.getOrder(orderId);
		Shipping shipping = mockShippoService.advanceTracking(order);
		return ResponseEntity.ok(shipping);
	}
}
