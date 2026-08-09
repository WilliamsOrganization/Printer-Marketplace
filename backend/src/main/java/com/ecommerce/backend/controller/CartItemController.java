package com.ecommerce.backend.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.dto.AddCartItemRequest;
import com.ecommerce.backend.dto.AddCartItemResponse;
import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.repository.CartItemRepository;
import com.ecommerce.backend.service.CartService;
import com.ecommerce.backend.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for cart item operations.
 */
@Slf4j
@RestController
@RequestMapping("/server/cartitem")
@RequiredArgsConstructor
public class CartItemController {
	private final CartItemRepository cartItemRepository;
	private final CartService cartService;
	private final UserService userService;

	/**
	 * getAll returns all cart items
	 * 
	 * @return
	 */
	@GetMapping
	public List<CartItem> getAll() {
		return cartItemRepository.findAll();
	}

	/**
	 * getOne returns a cart item by id
	 * 
	 * @param id
	 * @return
	 */
	@GetMapping("/{id}")
	public CartItem getOne(@PathVariable Long id) {
		return cartItemRepository.findById(id).orElseThrow();
	}

	/**
	 * Adds a new cart item to the cart. Or creates and links a new cart to a session if none exists.
	 * 
	 * @param request
	 * @return
	 */
	@PostMapping
	public AddCartItemResponse create(@RequestBody AddCartItemRequest request) {
		Users user = userService.getUserFromSession();
		Cart cart = cartService.getCart(user);
		AddCartItemResponse result = cartService.createCartItem(request, user, cart);
		return result;
	}

	/**
	 * updateCartItemQuantity updates the quantity of a cart item
	 * 
	 * @param id
	 * @param quantity
	 * @return
	 */
	@PutMapping("/quantity/{id}")
	@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
	public CartItem updateCartItemQuantity(@PathVariable Long id,
			@RequestBody Integer quantity) {
		CartItem cartItem = cartItemRepository.findById(id).orElseThrow();
		cartItem.setQuantity(quantity);
		return cartItemRepository.save(cartItem);
	}

	/**
	 * deleteCartItem deletes a cart item
	 * 
	 * @param id
	 */
	@DeleteMapping("/{id}")
	@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
	public void deleteCartItem(@PathVariable Long id) {
		cartService.deleteCartItem(id);
	}

}
