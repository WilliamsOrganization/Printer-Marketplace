package com.ecommerce.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

/**
 * RequestLogging
 */
@Configuration
public class RequestLogging {
	@Bean
	public CommonsRequestLoggingFilter requestLoggingFilter(){
		CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();
		filter.setIncludeQueryString(true);
		filter.setIncludePayload(true);
		filter.setMaxPayloadLength(1000);
		filter.setIncludeHeaders(false);
		filter.setBeforeMessagePrefix("INCOMING REQUEST: ");
		filter.setAfterMessagePrefix("REQUEST COMPLETE: ");
		return filter;
	}
}
