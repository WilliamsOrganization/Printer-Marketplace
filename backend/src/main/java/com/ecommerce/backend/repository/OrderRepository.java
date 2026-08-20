package com.ecommerce.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Users;

/**
 * Data access layer for Orders entities.
 */
public interface OrderRepository extends JpaRepository<Orders, Long> {

	/**
	 * Finds every order placed by a user.
	 * @param user the user
	 * @return the list of orders
	 */
	Optional<List<Orders>> findByUser(Users user);

	/**
	 * Finds an order by its Stripe checkout session id.
	 * @param stripeSessionId the Stripe checkout session id
	 * @return the order
	 */
	Optional<Orders> findOrderByStripeSessionId(String stripeSessionId);

	/**
	 * Finds an order by a user and id.
	 * @param user the user
	 * @param id the order id
	 * @return the order
	 */
	Optional<Orders> findByUserAndId(Users user, Long id);
}
