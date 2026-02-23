package com.ecommerce.backend.dto;

/**
 * CreateCatalogueResponse
 */
public record CreateCatalogResponse (
	String stripeProductId,
	String stripePriceId,
	String name,
	Long unitAmount,
	String currency
){}
