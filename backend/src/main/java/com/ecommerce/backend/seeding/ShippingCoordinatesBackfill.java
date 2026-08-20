package com.ecommerce.backend.seeding;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ecommerce.backend.entity.Shipping;
import com.ecommerce.backend.repository.ShippingRepository;
import com.ecommerce.backend.service.GoogleMapsService;
import com.google.maps.model.LatLng;

/**
 * One-time backfill for Shipping rows created before lat/lng were geocoded
 * at order-creation time (see OrderService.createPendingOrder). Naturally
 * idempotent - only rows still missing coordinates get touched, so this is
 * safe to leave running on every startup.
 */
@Configuration
public class ShippingCoordinatesBackfill {
	private static final Logger logger = LoggerFactory.getLogger(ShippingCoordinatesBackfill.class);

	@Bean
	ApplicationRunner backfillShippingCoordinates(ShippingRepository shippingRepository,
			GoogleMapsService googleMapsService) {
		return args -> {
			List<Shipping> ungeocodedTo = shippingRepository.findByLatIsNull();
			for (Shipping shipping : ungeocodedTo) {
				LatLng location = googleMapsService.geocode(shipping.getAddressTo());
				if (location == null) {
					logger.warn("[INIT]: could not geocode shipping {} destination", shipping.getId());
					continue;
				}
				shipping.setLat(location.lat);
				shipping.setLng(location.lng);
				shippingRepository.save(shipping);
			}
			if (!ungeocodedTo.isEmpty()) {
				logger.info("[INIT]: backfilled destination coordinates for {} shipping row(s)", ungeocodedTo.size());
			}

			List<Shipping> ungeocodedFrom = shippingRepository.findByFromLatIsNull();
			for (Shipping shipping : ungeocodedFrom) {
				LatLng location = googleMapsService.geocode(shipping.getAddressFrom());
				if (location == null) {
					logger.warn("[INIT]: could not geocode shipping {} pickup address", shipping.getId());
					continue;
				}
				shipping.setFromLat(location.lat);
				shipping.setFromLng(location.lng);
				shippingRepository.save(shipping);
			}
			if (!ungeocodedFrom.isEmpty()) {
				logger.info("[INIT]: backfilled pickup coordinates for {} shipping row(s)", ungeocodedFrom.size());
			}
		};
	}
}
