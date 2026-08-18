package com.ecommerce.backend.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ChatResponse {
	private Long id;
	private Long adminId;
	private Long customerId;
	private LocalDateTime createdAt;
}
