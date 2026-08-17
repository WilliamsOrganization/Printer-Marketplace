package com.ecommerce.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Returns;
import com.ecommerce.backend.entity.Users;

/**
 * Data access layer for Returns entities.
 */
public interface ReturnRepository extends JpaRepository<Returns, Long> {
	/**
	 * Finds a return by its orders.
	 * @param ordersId the orders
	 * @return the return
	 */
	public Returns findByOrder(Orders ordersId);

	/**
	 * Finds every return row that hasn't been geocoded yet.
	 * @return the un-geocoded returns rows
	 */
	public List<Returns> findByShipping_LatIsNull();

	/**
	 * Finds a return by its stripeRefundId.
	 * @param stripeRefundId the stripeRefundId
	 * @return the return
	 */
	public Returns findByStripeRefundId(String stripeRefundId);

	/**
	 * Finds every return filed by a user.
	 * @param user the user
	 * @return the user's returns
	 */
	public List<Returns> findByOrder_User(Users user);
}
