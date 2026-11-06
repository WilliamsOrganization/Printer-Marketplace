package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * OAuthRequest
 */
@Data
@AllArgsConstructor
public class AuthResponse {
	private String sessionToken;
	private Long userId;
	private String email;
	private String phoneNumber;
}
