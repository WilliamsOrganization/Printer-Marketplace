package com.ecommerce.backend.dto;

import java.util.List;

import com.ecommerce.backend.entity.OrderItem;
import lombok.Data;

/**
 * RefundRequest
 */
@Data
public class ReturnRequest {
	private Long orderId;
	private List<OrderItem> orderItems;
	private String reason;
}
