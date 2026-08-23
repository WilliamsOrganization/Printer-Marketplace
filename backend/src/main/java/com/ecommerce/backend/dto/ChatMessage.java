package com.ecommerce.backend.dto;

import java.time.LocalDateTime;

import com.ecommerce.backend.entity.Users;

import lombok.Data;

/**
 * ChatMessage
 */
@Data
@lombok.Builder
public class ChatMessage {
	private MessageType messageType;
	private String content;
	private Boolean sender;
	private LocalDateTime createdAt;
	private String id;

	public enum MessageType {
		CHAT,
		JOIN,
		LEAVE
	}
}
