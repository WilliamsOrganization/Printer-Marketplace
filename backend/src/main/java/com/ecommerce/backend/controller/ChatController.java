package com.ecommerce.backend.controller;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import com.ecommerce.backend.dto.ChatMessage;
import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.entity.Users;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ChatController
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {

	/**
	 * The Authentication param is resolved from the STOMP session's
	 * Principal - set on CONNECT by StompAuthChannelInterceptor, not from
	 * SecurityContextHolder (that's per-HTTP-request and isn't populated
	 * for STOMP message handling, which runs on the broker's own threads).
	 * Its principal is the Sessions entity, same object
	 * AuthService.buildAuthentication wraps for HTTP requests.
	 */
	@MessageMapping("/chat.message")
	@SendTo("/topic/chat")
	public ChatMessage chatMessage(ChatMessage message) {
		// Sessions session = (Sessions) authentication.getPrincipal();
		// Users user = session.getUser();
		ChatMessage chatMessage = ChatMessage.builder()
				.messageType(ChatMessage.MessageType.CHAT)
				.content("Hello from the backend you seem like a fun peron")
				.sender(false)
				.createdAt(LocalDateTime.now())
				.id(UUID.randomUUID().toString())
				.build();
		return chatMessage;
	}
}
