package com.ecommerce.backend.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private Long adminId;
    private Long customerId;
}
