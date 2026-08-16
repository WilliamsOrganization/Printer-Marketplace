package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ShipmentFromValues;
import com.ecommerce.backend.dto.ShipmentToValues;
import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.ShippingParcel;
import com.ecommerce.backend.service.CartService;
import com.ecommerce.backend.service.ShippingService;
import com.ecommerce.backend.service.ShippoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/server/shipping")
@RequiredArgsConstructor
public class ShippingController {

	private final ShippoService shippoService;
	private final ShippingService shippingService;
	private final CartService cartService;

	/**
	 * Quotes shipping rates for the current session's cart: combines all of
	 * its items into one estimated parcel (see
	 * ShippingService.estimateParcel) and asks Shippo for rates against it.
	 *
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 */
	@PostMapping("/rates")
	public ResponseEntity<?> getShipmentRates(@RequestBody ShipmentToValues shipmentToValues) {
		try {
			ShipmentFromValues shipmentFromValues = new ShipmentFromValues();
			Cart cart = cartService.getCartItems();
			ShippingParcel parcel = shippingService.estimateParcel(cart);
			var rates = shippoService.getShipmentRates(shipmentFromValues, shipmentToValues, parcel);
			return ResponseEntity.ok(rates);
		} catch (Exception e) {
			log.error("failed to get shipment rates: ", e);
			return ResponseEntity.internalServerError().build();
		}
	}
}
