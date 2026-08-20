package com.ecommerce.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.Users;

/**
 * Data access layer for User entities.
 */
public interface UserRepository extends JpaRepository<Users, Long> {
	/**
	 * Finds a user by their email address.
	 * @param email the email address
	 * @return the user
	 */
	Optional<Users> findByEmail(String email);

	/**
	 * Finds a user by their phone number.
	 * @param phoneNumber the phone number
	 * @return the user
	 */
	Optional<Users> findByPhoneNumber(String phoneNumber);
}
