package com.ecommerce.backend.dto;

/**
 * Partial update for a user's contact info - either field may be null,
 * meaning "leave unchanged."
 */
public record UpdateContactRequest(
	String email,
	String phoneNumber
) {}
