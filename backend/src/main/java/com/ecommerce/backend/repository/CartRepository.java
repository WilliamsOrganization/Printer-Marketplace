package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.Cart;

/**
 * Data access layer for Cart entities.
 */
public interface CartRepository extends JpaRepository<Cart, Long> {
}
