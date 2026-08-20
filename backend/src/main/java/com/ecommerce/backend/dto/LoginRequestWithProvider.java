package com.ecommerce.backend.dto;

import lombok.Data;

/**
 * LoginRequest	
 */
@Data
public class LoginRequestWithProvider {
	private String provider;
	private String providerAccountID;
	private String email;
	private String password;
	private String name;

}
