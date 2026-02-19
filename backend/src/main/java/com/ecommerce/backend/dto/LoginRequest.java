package com.ecommerce.backend.dto;

import lombok.Data;

/**
 * LoginRequest	
 */
@Data
public class LoginRequest {
	private String provider;
	private String providerAccountID;
	private String email;
	private String password;
	private String name;

}
