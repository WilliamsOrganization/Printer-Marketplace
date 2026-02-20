package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Sessions;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * Session access layer for main Authentication route
 */
public interface SessionRepository extends JpaRepository<Sessions, Long> {

	// uses the name of the field to generate sql
	long countByExpiresAtAfter(LocalDateTime now);

	@Query("SELECT COUNT(DISTINCT s.user.id) FROM Sessions s")
	long countUniqueUsers();
}
