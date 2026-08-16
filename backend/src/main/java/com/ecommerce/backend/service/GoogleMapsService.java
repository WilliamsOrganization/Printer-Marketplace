package com.ecommerce.backend.service;

import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import com.ecommerce.backend.entity.ShippingAddress;
import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.LatLng;

import lombok.extern.slf4j.Slf4j;

/**
 * Resolves a ShippingAddress into a lat/lng via the Google Geocoding API, so
 * it only ever needs to happen once (at order-creation time, or a one-time
 * backfill) rather than being re-geocoded by every client that wants to plot
 * it on a map.
 */
@Slf4j
@Service
public class GoogleMapsService {
	private final GeoApiContext context;

	public GoogleMapsService(String apiKey) {
		this.context = new GeoApiContext.Builder().apiKey(apiKey).build();
	}

	/**
	 * Geocodes a shipping address.
	 *
	 * @param address the address to geocode
	 * @return the resolved lat/lng, or null if it couldn't be geocoded
	 */
	public LatLng geocode(ShippingAddress address) {
		String query = buildQuery(address);
		if (query.isBlank()) return null;
		try {
			GeocodingResult[] results = GeocodingApi.geocode(context, query).await();
			if (results.length == 0) {
				log.warn("No geocoding results for address: {}", query);
				return null;
			}
			return results[0].geometry.location;
		} catch (Exception e) {
			log.error("Failed to geocode address '{}': {}", query, e.getMessage());
			return null;
		}
	}

	private String buildQuery(ShippingAddress address) {
		return String.join(", ",
				Stream.of(address.getStreet1(), address.getStreet2(), address.getCity(),
						address.getState(), address.getZip(), address.getCountry())
						.filter(s -> s != null && !s.isBlank())
						.toList());
	}
}
