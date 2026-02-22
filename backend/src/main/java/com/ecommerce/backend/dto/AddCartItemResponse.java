package com.ecommerce.backend.dto;

import com.ecommerce.backend.entity.CartItem;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * AddCartItemRequest
 */
@Data
@AllArgsConstructor
public class AddCartItemResponse {
	private CartItem cartItem;
	private String sessionToken;
}
