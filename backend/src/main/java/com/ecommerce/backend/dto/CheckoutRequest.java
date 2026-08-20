package com.ecommerce.backend.dto;

/**
 * CheckoutRequest
 */
public record CheckoutRequest (
	String email,
	String phoneNumber,
	String selectedShippingID
){}
