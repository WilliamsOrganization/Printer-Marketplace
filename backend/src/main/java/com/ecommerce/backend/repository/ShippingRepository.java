package com.ecommerce.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Shipping;

/**
 * Data access layer for Shipping entities.
 */
public interface ShippingRepository extends JpaRepository<Shipping, Long> {
	/**
	 * Finds a shipping by its orders.
	 * @param ordersId the orders
	 * @return the shipping
	 */
	Optional<Shipping> findByOrders(Orders ordersId);
}
