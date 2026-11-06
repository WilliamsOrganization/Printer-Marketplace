package com.ecommerce.backend.dto;

import com.ecommerce.backend.entity.Orders;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * OrderResponse
 */
@Data
@AllArgsConstructor
public class OrderResponse {
	private Orders order;
	private CheckoutSummary session;
}
