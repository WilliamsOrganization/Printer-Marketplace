package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.EmailVerification;
import com.ecommerce.backend.entity.EmailVerification.Reason;
import com.ecommerce.backend.entity.Users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
	EmailVerification findFirstByUserAndReasonOrderByCreatedAtDesc(Users user, Reason reason);
}
