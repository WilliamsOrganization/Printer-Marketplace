package com.ecommerce.backend.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// import com.ecommerce.backend.dto.ChatMessageRequest;
import com.ecommerce.backend.dto.ChatRequest;
import com.ecommerce.backend.dto.ChatResponse;
import com.ecommerce.backend.entity.Chat;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.service.ChatService;
import com.ecommerce.backend.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ChatController
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/server/chats")
public class ChatController {
	private final ChatService chatService;
	private final UserService userService;

	/**
	 * Creates a chat between two users
	 * @param request
	 * @return
	 */
	@PostMapping("/create")
	public Chat createChat(@RequestBody ChatRequest request) {
		Users user = userService.getUserFromSession();
		return chatService.createChat(user, request.getAdminId(), request.getCustomerId());
	}

	//
	// /**
	//  * Sends a message to a chat
	//  * @param request
	//  * @return
	//  */
	// @PostMapping("/message")
	// public Chat sendMessage(@RequestBody ChatMessageRequest request) {
	// 	Users user = userService.getUserFromSession();
	// 	return chatService.sendMessage(user, request.getChatId(), request.getMessage());
	// }


	/**
	 * Gets all chats for a user
	 * @return
	 */
	@GetMapping("/")
	public List<ChatResponse> getUserChats() {
		Users user = userService.getUserFromSession();
		return chatService.getChatResponsesByUser(user);
	}

	/**
	 * Gets all chats for a user, mapped to the flattened response shape list
	 * endpoints send to the frontend.
	 * @return
	 */
	@GetMapping("/all")
	@PreAuthorize("hasRole('ADMIN')")
	public List<ChatResponse> getAllChats() {
		return chatService.getAllChatResponses();
	}
}
