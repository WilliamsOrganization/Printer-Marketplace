package com.ecommerce.backend.config;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import com.stripe.Stripe;


/**
 * Configures the Stripe SDK's global API key on startup.
 */
@Configuration
public class StripeConfig {

	@Value("${stripe.secret.key}")
	private String stripeSecretKey;

	/**
	 * Sets the static Stripe.apiKey used by all Stripe SDK calls
	 * (Product.create, Price.create, Session.create, etc.) in this app.
	 */
	@PostConstruct
	void init() {
		Stripe.apiKey = stripeSecretKey;
	}
}
