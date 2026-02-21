package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * AddCartItemRequest
 */
@Data
@AllArgsConstructor
public class AddCartItemRequest {
	private Long itemId;
	private Integer quantity;
}
