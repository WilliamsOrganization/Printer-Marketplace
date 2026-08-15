package com.ecommerce.backend.dto;

import lombok.Data;

/**
 * Partial update for a user's contact info - either field may be null,
 * meaning "leave unchanged."
 */
@lombok.Builder
public record UpdateContactRequest(
	String email,
	String phoneNumber
) {}
