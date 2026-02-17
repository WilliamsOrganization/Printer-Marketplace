package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.entity.Users;

/**
 * InventoryItemRepository	
 */
public interface CartRepository extends JpaRepository<Cart, Long> {
}
