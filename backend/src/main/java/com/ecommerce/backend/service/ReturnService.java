package com.ecommerce.backend.service;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import com.ecommerce.backend.dto.ReturnRequest;
import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Returns;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ReturnRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * OrderService
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReturnService {
	private static final Long DOLLAR = 100L;
	private final ReturnRepository returnRepository;
	private final UserService userService;
	private final ResendService resendService;
	private final GoogleMapsService googleMapsService;
	private final OrderService orderService;

	/** 
	 * Creates a pending return request for admin to review and approve
	 * @param orderId
	 * @param reason
	 * @return
	 */
	public Returns createPendingReturnRequest(Users user, ReturnRequest request) {
		Orders order = orderService.getOrderByUserAndId(user, request.getOrderId());
		Returns returnRequest = Returns.builder()
				.order(order)
				.reasonForReturn(request.getReason())
				.status(Returns.ReturnStatus.PENDING)
				.build();
		return returnRepository.save(returnRequest);
	}


	/**
	 * Gets all returns for a user
	 * @param user
	 * @return
	 */
	public List<Returns> getReturnsByUser(Users user) {
		return returnRepository.findByOrder_User(user);
	}

	/**
	 * Admin route for fetching all returns
	 * @return
	 */
	public List<Returns> getAllReturns() {
		return returnRepository.findAll();
	}
}
