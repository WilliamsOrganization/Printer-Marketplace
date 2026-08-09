package com.ecommerce.backend.dto;

/**
 * ShippingQuote
 */
public record ShippingQuote (
	String name,
	Long amountInCents,
	String currency
){}
