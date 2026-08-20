package com.ecommerce.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.ChatResponse;
import com.ecommerce.backend.entity.Chat;
import com.ecommerce.backend.entity.Users;
// import com.ecommerce.backend.repository.ChatRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ChatService
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    // private final ChatRepository chatRepository;

    /**
     * Creates a chat between two users
     *
     * @param admin
     * @param customer
     * @return
     */
    public List<ChatResponse> getChatResponsesByUser(Users user) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException(
            "Unimplemented method 'getChatResponsesByUser'");
    }

    /**
     * Creates a chat between two users
     *
     * @param admin
     * @param customer
     * @return
     */
    public Chat createChat(Users admin, Long customerId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException(
            "Unimplemented method 'createChat'");
    }

    /**
     * Gets all chats for a user
     *
     * @param user
     * @return
     */
    public List<ChatResponse> getAllChatResponses() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException(
            "Unimplemented method 'getAllChatResponses'");
    }

	/**
	 * Creates a chat between two users
	 * @param user
	 * @param adminId
	 * @param customerId
	 * @return
	 */
	public Chat createChat(Users user, Long adminId, Long customerId) {
		// TODO Auto-generated method stub
		throw new UnsupportedOperationException("Unimplemented method 'createChat'");
	}
}
