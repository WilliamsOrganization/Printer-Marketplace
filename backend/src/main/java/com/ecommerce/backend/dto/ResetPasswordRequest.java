package com.ecommerce.backend.dto;

import lombok.Data;

/**
 * EmailVerificationRequest
 */
@Data
public class ResetPasswordRequest {
	private String email;
}

