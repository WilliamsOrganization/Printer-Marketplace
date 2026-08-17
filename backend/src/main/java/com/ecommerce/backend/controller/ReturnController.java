package com.ecommerce.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.dto.ReturnRequest;
import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Returns;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.exception.OrderNotFoundException;
import com.ecommerce.backend.service.OrderService;
import com.ecommerce.backend.service.ReturnService;
import com.ecommerce.backend.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ReturnController
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/returns")
public class ReturnController {
	private final ReturnService returnService;
	private final OrderService orderService;
	private final UserService userService;

	/**
	 * Creates a pending return request for admin to review and approve
	 * @param user
	 * @param request
	 * @return
	 */
	@PostMapping
	public Returns createPendingReturn(@RequestBody ReturnRequest request) {
		Users user = userService.getUserFromSession();
		return returnService.createPendingReturnRequest(user, request);
	}

	/**
	 * Gets a return by its id.
	 * @param id the return's id
	 * @return the return
	 */
	@GetMapping("/")
	public List<Returns> getUserReturns(@PathVariable Long id) {
		Users user = userService.getUserFromSession();
		return returnService.getReturnsByUser(user);
	}

	/**
	 *
	 *
	 */
	@GetMapping("/all")
	@PreAuthorize("hasRole('ADMIN')")
	public List<Returns> getAllReturns() {
		return  returnService.getAllReturns();
	}
}
