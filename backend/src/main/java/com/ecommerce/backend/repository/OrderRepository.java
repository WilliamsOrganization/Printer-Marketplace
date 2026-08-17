package com.ecommerce.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Users;

/**
 * OrderService
 */
public interface OrderRepository extends JpaRepository<Orders, Long> {

	/**
	 * Finds an order by its user.
	 * @return the list of orders
	 */
	Optional<List<Orders>> findByUser(Users user);
	
	/**
	 * Finds an order by its id.
	 * @param id the order id
	 * @return the order
	 */
	Optional<Orders> findOrderByStripeSessionId(String stripeSessionId);

	Optional<Orders> findByUserAndId(Users user, Long id);
}
