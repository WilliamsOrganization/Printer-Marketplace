package com.ecommerce.backend.dto;

import lombok.Data;

/**
 * AccountCreationRequest
 */
@Data
public class AccountCreationRequest {
	private String email;
	private String password;
	private String sessionId;
	private String phoneNumber;
}
