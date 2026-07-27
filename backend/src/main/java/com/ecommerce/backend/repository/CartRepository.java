package com.ecommerce.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.Users;

/**
 * Data access layer for Cart entities.
 */
public interface CartRepository extends JpaRepository<Cart, Long> {
	/**
	 * Finds a cart by its user.
	 * @param user the user
	 * @return the cart
	 */
	Optional<Cart> findByUser(Users user);
}
