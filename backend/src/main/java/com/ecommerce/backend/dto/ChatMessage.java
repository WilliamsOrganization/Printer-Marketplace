/* (C)2026 */
package com.ecommerce.backend.dto;

import java.time.LocalDateTime;

import lombok.Data;

/**
 * ChatMessage
 */
@Data
@lombok.Builder
public class ChatMessage {
	public enum MessageType {
		CHAT, JOIN, LEAVE
	}
	private MessageType messageType;
	private String content;
	private Boolean sender;
	private LocalDateTime createdAt;

	private String id;
}
