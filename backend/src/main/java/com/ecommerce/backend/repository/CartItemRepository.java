package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.entity.Users;

/**
 * InventoryItemRepository	
 */
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
