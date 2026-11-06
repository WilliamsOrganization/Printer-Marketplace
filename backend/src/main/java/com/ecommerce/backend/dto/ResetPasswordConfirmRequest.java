package com.ecommerce.backend.dto;

import lombok.Data;

/**
 * ResetPasswordConfirmRequest
 */
@Data
public class ResetPasswordConfirmRequest {
	private String email;
	private String verificationString;
	private String password;
}
