package com.ecommerce.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

/**
 * RequestLogging
 */
@Configuration
public class RequestLogging {
	private static final int maxPayloadLength = 1024;

	/**
	 * Creates a new CommonsRequestLoggingFilter.
	 * @return the new CommonsRequestLoggingFilter
	 */
	@Bean
	CommonsRequestLoggingFilter requestLoggingFilter(){
		CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();
		filter.setIncludeQueryString(true);
		filter.setIncludePayload(false);
		filter.setMaxPayloadLength(maxPayloadLength);
		filter.setIncludeHeaders(false);
		filter.setBeforeMessagePrefix("INCOMING REQUEST: ");
		filter.setAfterMessagePrefix("REQUEST COMPLETE: ");
		return filter;
	}
}
