package com.ecommerce.backend.dto;

/**
 * CheckoutSummary is the subset of a Stripe checkout Session's fields the
 * frontend actually needs, so the raw Stripe SDK object (which isn't
 * Jackson-serializable) never has to leave the backend.
 */
public record CheckoutSummary(
		String status,
		String customerEmail,
		Long amountTotal,
		String currency) {
}
