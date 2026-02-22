package com.ecommerce.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.CartItem;

import jakarta.transaction.Transactional;

import java.util.List;


/**
 * Data access layer for CartItem entities.
 */
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
	List<CartItem> findByCart(Cart cart);

	void deleteByIdAndCart(Long id, Cart cart);
}
