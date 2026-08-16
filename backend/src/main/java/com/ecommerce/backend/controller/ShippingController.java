package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.CreateShippingLabelRequest;
import com.ecommerce.backend.dto.ShipmentFromValues;
import com.ecommerce.backend.dto.ShipmentToRequest;
import com.ecommerce.backend.dto.UpdateContactRequest;
import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Shipping;
import com.ecommerce.backend.entity.ShippingParcel;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.exception.ExistingUserFoundException;
import com.ecommerce.backend.service.CartService;
import com.ecommerce.backend.service.OrderService;
import com.ecommerce.backend.service.ShippingService;
import com.ecommerce.backend.service.ShippoService;
import com.ecommerce.backend.service.UserService;
import com.goshippo.shippo_sdk.models.components.WebhookPayloadTrack;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * ShippingController
 */
@Slf4j
@RestController
@RequestMapping("/server/shipping")
@RequiredArgsConstructor
public class ShippingController {

	private final UserService userService;
	private final ShippoService shippoService;
	private final ShippingService shippingService;
	private final CartService cartService;
	private final OrderService orderService;

	/**
	 * Quotes shipping rates for the current session's cart: combines all of
	 * its items into one estimated parcel (see
	 * ShippingService.estimateParcel) and asks Shippo for rates against it.
	 *
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 */
	@PostMapping("/rates")
	public ResponseEntity<?> getShipmentRates(@RequestBody ShipmentToRequest shipmentToValues) {
		try {
			ShipmentFromValues shipmentFromValues = new ShipmentFromValues();
			Users user = userService.getUserFromSession();
			Cart cart = cartService.getCartItems(user);
			userService.updateContactInfo(user, UpdateContactRequest.builder()
					.email(shipmentToValues.getEmail())
					.phoneNumber(shipmentToValues.getPhone())
					.build());
			ShippingParcel parcel = shippingService.estimateParcel(cart);
			var rates = shippoService.getShipmentRates(shipmentFromValues, shipmentToValues, parcel);
			return ResponseEntity.ok(rates);
		} catch (ExistingUserFoundException e) {
			throw e;
		} catch (Exception e) {
			log.error("failed to get shipment rates: ", e);
			return ResponseEntity.internalServerError().build();
		}

	}

	/**
	 * Purchases a shipping label for an order, against the admin's chosen
	 * real-world box size/weight - triggered from the shipments admin table,
	 * not automatically at checkout.
	 *
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 */
	@PostMapping("/{orderId}/label")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Shipping> createShippingLabel(@PathVariable Long orderId,
			@RequestBody CreateShippingLabelRequest request) {
		try {
			Orders order = orderService.getOrder(orderId);
			Shipping shipping = shippingService.createShippingLabel(order, request.lengthCm(), request.widthCm(),
					request.heightCm(), request.weightGrams());
			return ResponseEntity.ok(shipping);
		} catch (Exception e) {
			log.error("failed to create shipping label for order {}: ", orderId, e);
			return ResponseEntity.internalServerError().build();
		}
	}

	/**
	 * Shippo's track_updated webhook - updates the shipment's status and
	 * last-known checkpoint as the carrier scans it. Exempted from session
	 * auth in SessionAuthFilter, same as the Stripe webhook - Shippo calls
	 * this directly with no session token.
	 *
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 */
	@PostMapping("/webhook")
	public ResponseEntity<Void> handleTrackingWebhook(@RequestBody WebhookPayloadTrack payload) {
		try {
			shippingService.applyTrackingUpdate(payload);
			return ResponseEntity.ok().build();
		} catch (Exception e) {
			log.error("failed to apply tracking update: ", e);
			return ResponseEntity.internalServerError().build();
		}
	}
}

