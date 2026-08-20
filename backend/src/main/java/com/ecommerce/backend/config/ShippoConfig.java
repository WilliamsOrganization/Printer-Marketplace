package com.ecommerce.backend.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.goshippo.shippo_sdk.Shippo;


/**
 * InnerShippoConfig
 */
@Configuration
public class ShippoConfig {
	@Value("${shippo.token}")
	private String token;

	/**
	 * Creates a new Shippo.
	 * @return the new Shippo
	 */
	@Bean
	Shippo shippo() {
		return Shippo.builder()
				.apiKeyHeader(token)
				.shippoApiVersion("2018-02-08")
				.build();
	}
}
