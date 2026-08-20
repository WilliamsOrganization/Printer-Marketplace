package com.ecommerce.backend.dto;

import lombok.Data;

/**
 * EmailVerificationRequest
 */
@Data
public class EmailVerificationRequest {
	private String verificationString;
}

