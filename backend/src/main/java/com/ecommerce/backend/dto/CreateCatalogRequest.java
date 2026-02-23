package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CreateCatalogRequest
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateCatalogRequest {
	private String name;
	private String description;
	private Long unitAmount;
	private String currency;
	private Long quantity;
}
