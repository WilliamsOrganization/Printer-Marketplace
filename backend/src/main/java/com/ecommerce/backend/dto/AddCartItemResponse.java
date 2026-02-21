package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * AddCartItemRequest
 */
@Data
@AllArgsConstructor
public class AddCartItemResponse {
	private Long itemId;
	private String sessionToken;
}
