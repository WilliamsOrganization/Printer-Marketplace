package com.ecommerce.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.ecommerce.backend.entity.OrderItem;
import com.ecommerce.backend.entity.Returns;

import lombok.Data;

/**
 * Flattened view of a Returns row for list endpoints - Returns.order is
 * @JsonBackReference (to break the Orders <-> Returns <-> Shipping.returns
 * cycle), so it never serializes; this pulls just the order fields a
 * returns list needs to link back to the order.
 */
@Data
public class ReturnResponse {
	private Long id;
	private LocalDateTime requestedDate;
	private Long orderId;
	private String orderStripeSessionId;
	private List<OrderItem> itemsToReturn;
	private String reasonForReturn;
	private Returns.ReturnStatus status;
	private Long refundedAmount;
	private LocalDateTime refundedAt;
	private Boolean reviewed;

	public static ReturnResponse from(Returns returns) {
		ReturnResponse response = new ReturnResponse();
		response.id = returns.getId();
		response.requestedDate = returns.getRequestedDate();
		response.orderId = returns.getOrder() != null ? returns.getOrder().getId() : null;
		response.orderStripeSessionId = returns.getOrder() != null ? returns.getOrder().getStripeSessionId() : null;
		response.itemsToReturn = returns.getItemsToReturn();
		response.reasonForReturn = returns.getReasonForReturn();
		response.status = returns.getStatus();
		response.refundedAmount = returns.getRefundedAmount();
		response.refundedAt = returns.getRefundedAt();
		response.reviewed = returns.getReviewed();
		return response;
	}
}
