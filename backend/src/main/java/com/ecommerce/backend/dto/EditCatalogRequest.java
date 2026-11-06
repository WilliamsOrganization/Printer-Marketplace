package com.ecommerce.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * EditCatalogRequest
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EditCatalogRequest {
	private String name;
	private String description;
	private List<String> imageUrls;
	private Long unitAmount;
	private String currency;
}
