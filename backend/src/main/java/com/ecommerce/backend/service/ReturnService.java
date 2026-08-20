package com.ecommerce.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.ReturnRequest;
import com.ecommerce.backend.dto.ReturnResponse;
import com.ecommerce.backend.entity.OrderItem;
import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Returns;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.exception.NotFoundException;
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
	// private static final Long DOLLAR = 100L;
	private final ReturnRepository returnRepository;
	private final UserService userService;
	private final OrderService orderService;

	/** 
	 * Creates a pending return request for admin to review and approve
	 * @param orderId
	 * @param reason
	 * @return
	 */
	public Returns createPendingReturnRequest(Users user, ReturnRequest request) {
		Orders order = orderService.getOrderByUserAndId(user, request.getOrderId());
		List<OrderItem> itemsToReturn = resolveItemsToReturn(order, request.getOrderItems());

		Returns returnRequest = Returns.builder()
				.order(order)
				.requestedDate(LocalDateTime.now())
				.itemsToReturn(itemsToReturn)
				.reasonForReturn(request.getReason())
				.status(Returns.ReturnStatus.PENDING)
				.build();
		orderService.setOrderReturned(order);
		return returnRepository.save(returnRequest);
	}

	/**
	 * Matches the client-supplied items against the order's own managed
	 * OrderItem rows by id, rather than trusting the (detached) items the
	 * client sent - keeps a client-supplied payload from being able to
	 * overwrite an existing line item's fields via merge.
	 */
	private List<OrderItem> resolveItemsToReturn(Orders order, List<OrderItem> requestedItems) {
		List<Long> requestedItemIds = new ArrayList<>();
		for (OrderItem requestedItem : requestedItems) {
			requestedItemIds.add(requestedItem.getId());
		}

		List<OrderItem> itemsToReturn = new ArrayList<>();
		for (OrderItem item : order.getItems()) {
			if (requestedItemIds.contains(item.getId())) {
				itemsToReturn.add(item);
			}
		}
		return itemsToReturn;
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
	 * Gets all returns for a user, mapped to the flattened response shape
	 * list endpoints send to the frontend.
	 * @param user
	 * @return
	 */
	public List<ReturnResponse> getReturnResponsesByUser(Users user) {
		return mapToResponses(getReturnsByUser(user));
	}

	private List<ReturnResponse> mapToResponses(List<Returns> returns) {
		List<ReturnResponse> responses = new ArrayList<>();
		for (Returns r : returns) {
			responses.add(ReturnResponse.from(r));
		}
		return responses;
	}

	/**
	 * Admin route for fetching all returns
	 * @return
	 */
	public List<Returns> getAllReturns() {
		return returnRepository.findAll();
	}

	/**
	 * Gets all returns, mapped to the flattened response shape list
	 * endpoints send to the frontend.
	 * @return
	 */
	public List<ReturnResponse> getAllReturnResponses() {
		return mapToResponses(getAllReturns());
	}

	/**
	 * Toggles the reviewed status of a Return Admin only
	 *
	 * @author William Ewanchuk
	 */
	public Returns toggleReviewAndNotifyHandler(Long returnId, Boolean reviewed) {
		Users user = userService.getUserFromSession();
		if (user.getUserRole() !=  Users.Role.ADMIN) {
			throw new IllegalStateException("User must be an admin to toggle a return");
		}
		Returns returnObj = returnRepository.findById(returnId).orElseThrow(()-> new NotFoundException("Return not found: returnId"));
		returnObj.setReviewed(reviewed);
		return returnRepository.save(returnObj);
	}
}
