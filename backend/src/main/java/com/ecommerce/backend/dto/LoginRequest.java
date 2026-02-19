package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * LoginRequest	
 */
@Data
public class LoginRequest {
	private String provider;
	private String providerAccountID;
	private String email;
	private String name;
}
