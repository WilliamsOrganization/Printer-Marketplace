package com.ecommerce.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * PasswordEncoderConfig
 *
 * Split out from SecurityConfig so that beans needing only a PasswordEncoder
 * (e.g. UserService) don't pull in SecurityConfig - which itself depends on
 * SessionAuthFilter, and SessionAuthFilter depends (transitively, via
 * AuthService -> UserService) on PasswordEncoder. Keeping them together
 * created a circular bean dependency.
 */
@Configuration
public class PasswordEncoderConfig {
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
