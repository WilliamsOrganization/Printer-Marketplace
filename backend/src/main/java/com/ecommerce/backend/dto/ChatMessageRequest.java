package com.ecommerce.backend.dto;

import lombok.Data;

/**
 * ChatMessageRequest
 */
@Data
public class ChatMessageRequest {
    private Long chatId;
    private String message;
}
