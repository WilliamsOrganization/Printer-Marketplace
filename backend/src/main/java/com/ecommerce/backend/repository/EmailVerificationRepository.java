package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.EmailVerification;
import com.ecommerce.backend.entity.EmailVerification.Reason;
import com.ecommerce.backend.entity.Users;

/**
 * Data access layer for EmailVerification entities.
 */
@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
	/**
	 * Finds the most recently created email verification for a user and reason.
	 * @param user the user
	 * @param reason the verification reason
	 * @return the most recent matching email verification
	 */
	EmailVerification findFirstByUserAndReasonOrderByCreatedAtDesc(Users user, Reason reason);
}
