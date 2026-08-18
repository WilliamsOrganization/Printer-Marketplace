package com.ecommerce.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.Chat;

/**
 * ChatRepository
 */
@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
	/**
	 * Finds all chats for a given admin
	 * @param adminId
	 * @return
	 */
	List<Chat> findByAdmin(Long adminId);
}
