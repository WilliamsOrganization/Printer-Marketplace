package com.ecommerce.backend.config;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ResendConfig
 */
@Configuration
public class ResendConfig {
	@Value("${resend.api_key}")
	private String apiKey;

	@Value("${resend.webhook_secret}")
	private String webhook;

	@Bean
	public Resend resend() {
		return new Resend(apiKey);
	}
}
