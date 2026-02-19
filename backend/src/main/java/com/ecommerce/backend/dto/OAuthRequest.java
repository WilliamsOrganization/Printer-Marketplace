package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * OAuthRequest
 */
@Data
public class OAuthRequest {
	private String provider;
	private String providerAccountID;
	private String email;
	private String name;
}
