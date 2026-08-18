package com.ecommerce.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.dto.ReturnBodyToggleRequest;
import com.ecommerce.backend.dto.ReturnRequest;
import com.ecommerce.backend.dto.ReturnResponse;
import com.ecommerce.backend.entity.Returns;
import com.ecommerce.backend.entity.Users;
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
@RequestMapping("/server/returns")
public class ReturnController {
	private final ReturnService returnService;
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
	 * Gets every return the current user has requested.
	 * @return the user's returns
	 */
	@GetMapping("/")
	public List<ReturnResponse> getUserReturns() {
		Users user = userService.getUserFromSession();
		return returnService.getReturnResponsesByUser(user);
	}

	/**
	 *
	 *
	 */
	@GetMapping("/all")
	@PreAuthorize("hasRole('ADMIN')")
	public List<ReturnResponse> getAllReturns() {
		return returnService.getAllReturnResponses();
	}
	
	/**
	 * Gets a return by id
	 * @param request
	 * @return
	 */
	@PostMapping("/review")
	@PreAuthorize("hasRole('ADMIN')")
	public Returns toggleReviewAndNotifyHandler(@RequestBody ReturnBodyToggleRequest request) {
		return returnService.toggleReviewAndNotifyHandler(request.getId(), request.getReviewed());
	}
}
