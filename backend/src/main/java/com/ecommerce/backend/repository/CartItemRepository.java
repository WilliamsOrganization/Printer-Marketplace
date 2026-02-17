package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.CartItem;

/**
 * Data access layer for CartItem entities.
 */
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
