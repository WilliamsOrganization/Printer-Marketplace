package com.ecommerce.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.resend.Resend;

/**
 * ResendConfig
 */
@Configuration
public class ResendConfig {
	@Value("${resend.api_key}")
	private String apiKey;

	@Value("${resend.webhook_secret}")
	private String webhook;

	/**
	 * Creates a new Resend.
	 * @return the new Resend
	 */
	@Bean
	Resend resend() {
		return new Resend(apiKey);
	}
}
