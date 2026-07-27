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

	@PostMapping("/rates")
	public ResponseEntity<?> getRates(@RequestBody ShipmentToValues shipmentToValues) {
		try {

			ShipmentFromValues shipmentFromValues = new ShipmentFromValues();
			CreateLiveRateResponse response = shippoService.createShipmentResponse(shipmentFromValues,
					shipmentToValues);
			return ResponseEntity.ok(
					response.liveRatePaginatedList().orElse(null));
		} catch (Exception e) {
			// TODO: handle exception
			log.error("failed to Create Shipping Live Rates return type: " , e);
			return ResponseEntity.internalServerError().build();
		}
	}

	// TODO: make this fetch real data. the frontend will handle breaking apart the shipping information into chunks then we ingest them from the backend
	@PostMapping("/rates/test")
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
