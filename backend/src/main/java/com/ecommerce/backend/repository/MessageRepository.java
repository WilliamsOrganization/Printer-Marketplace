package com.ecommerce.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.Message;


/**
 * MessageRepository
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
	/**
	 * Finds all messages for a given chat
	 * @param chatId
	 * @return
	 */
	List<Message> findByChat(Long chatId);
}
