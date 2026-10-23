/* (C)2026 */
package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.CartItemFieldOptionsStlColor;

@Repository
public interface CartItemFieldOptionsStlColorRepository extends JpaRepository<CartItemFieldOptionsStlColor, Long> {
}
