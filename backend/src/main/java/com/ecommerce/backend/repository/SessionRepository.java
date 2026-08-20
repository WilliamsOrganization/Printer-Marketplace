package com.ecommerce.backend.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.entity.Users;

/**
 * Session access layer for main Authentication route
 */
public interface SessionRepository extends JpaRepository<Sessions, Long> {

	/**
	 * Counts sessions that have not yet expired as of the given time.
	 * @param now the reference time
	 * @return the count of active sessions
	 */
	long countByExpiresAtAfter(LocalDateTime now);

	/**
	 * Counts the number of distinct users with a session.
	 * @return the count of unique users
	 */
	@Query("SELECT COUNT(DISTINCT s.user.id) FROM Sessions s")
	long countUniqueUsers();

	/**
	 * Finds a session by its token, eagerly fetching the associated user.
	 * @param token the session token
	 * @return the session, with its user loaded
	 */
	@Query("SELECT s FROM Sessions s LEFT JOIN FETCH s.user WHERE s.token= :token")
	Optional<Sessions> findbyTokenWithUser(@Param("token") String token);

	/**
	 * Finds a session by its user.
	 * @param user the user
	 * @return the session
	 */
	Optional<Sessions> findByUser(Users user);


}
