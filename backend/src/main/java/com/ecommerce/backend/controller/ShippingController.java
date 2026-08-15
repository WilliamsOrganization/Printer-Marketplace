package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ShipmentFromValues;
import com.ecommerce.backend.dto.ShipmentToValues;
import com.ecommerce.backend.service.ShippoService;
import com.goshippo.shippo_sdk.models.operations.CreateLiveRateResponse;
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
	
	/**
	 * This a working endpoint now
	 *
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 */
	@PostMapping("/rates")
	public ResponseEntity<?> getShipmentRates(@RequestBody ShipmentToValues shipmentToValues) {
		try {
			ShipmentFromValues shipmentFromValues = new ShipmentFromValues();
			var rates = shippoService.getShipmentRates(shipmentFromValues, shipmentToValues);
			return ResponseEntity.ok(rates);
		} catch (Exception e) {
			log.error("failed to get shipment rates: ", e);
			return ResponseEntity.internalServerError().build();
		}
	}
}
