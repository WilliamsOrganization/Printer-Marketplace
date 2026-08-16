package com.ecommerce.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Google Maps Geocoding Api for shipping address lookups. 
 * 
 * @author William E. Chanchuk
 *
 */
@Configuration
public class GoogleMaps {

	@Value("${google.maps.api.key}")
	private String apiKey;

	
	/**
	 * 
	 * @return the google maps api key
	 */
	@Bean
	public String getApiKey() {
		return apiKey;
	}
}
