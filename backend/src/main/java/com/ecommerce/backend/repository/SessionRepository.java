package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.entity.Users;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Session access layer for main Authentication route
 */
public interface SessionRepository extends JpaRepository<Sessions, Long> {

	// uses the name of the field to generate sql
	long countByExpiresAtAfter(LocalDateTime now);

	@Query("SELECT COUNT(DISTINCT s.user.id) FROM Sessions s")
	long countUniqueUsers();

	@Query("SELECT s FROM Sessions s JOIN FETCH s.user WHERE s.token= :token")
	Optional<Sessions> findbyTokenWithUser(@Param("token") String token);

	Optional<Sessions> findByUser(Users user);


}
