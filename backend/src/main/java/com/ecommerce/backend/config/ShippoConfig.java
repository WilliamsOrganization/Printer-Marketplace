package com.ecommerce.backend.config;
import com.goshippo.shippo_sdk.Shippo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


/**
 * InnerShippoConfig
 */
@Configuration
public class ShippoConfig {
	@Value("${shippo.token}")
	private String token;

	// @Value("${resend.webhook_secret}")
	// private String webhook;

	@Bean
	public Shippo shippo() {
		return Shippo.builder()
				.apiKeyHeader(token)
				.shippoApiVersion("2018-02-08")
				.build();
	}
}
