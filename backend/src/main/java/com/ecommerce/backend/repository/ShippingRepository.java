package com.ecommerce.backend.repository;

import java.util.List;
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

	/**
	 * Finds every shipping row that hasn't been geocoded yet.
	 * @return the un-geocoded shipping rows
	 */
	List<Shipping> findByLatIsNull();

	/**
	 * Finds a shipping by its carrier tracking number - how the Shippo
	 * track_updated webhook looks up which row to update.
	 * @param trackingNumber the carrier tracking number
	 * @return the shipping
	 */
	Optional<Shipping> findByTrackingNumber(String trackingNumber);
}
