package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AddCartItemRequest;
import com.ecommerce.backend.dto.AddCartItemResponse;
import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.repository.CartItemRepository;
import com.ecommerce.backend.service.CartService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;


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

	@GetMapping
	public List<CartItem> getAll() {
		return cartItemRepository.findAll();
	}

	@GetMapping("/{id}")
	public CartItem getOne(@PathVariable Long id) {
		return cartItemRepository.findById(id).orElseThrow();
	}

	@PostMapping
	public CartItem create(@RequestBody AddCartItemRequest request,
			HttpServletResponse response) {
		AddCartItemResponse result = cartService.createCartItem(request);
		if (result.getSessionToken() != null) {
			Cookie cookie = new Cookie("session_token", result.getSessionToken());
			cookie.setHttpOnly(true);
			cookie.setPath("/");
			cookie.setMaxAge(30 * 24 * 60 * 60);
			response.addCookie(cookie);
		} else {
			log.info("No Session token was created or assigned");
		}
		return result.getCartItem();
	}


	@PutMapping("/quantity/{id}")
	@PreAuthorize("hasRole('CUSTOMER')")
		public CartItem updateCartItemQuantity(@PathVariable Long id, @RequestBody Integer quantity) {
			CartItem cartItem = cartItemRepository.findById(id).orElseThrow();
			cartItem.setQuantity(quantity);
			return cartItemRepository.save(cartItem);
		}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('CUSTOMER')")
	@Transactional
	public void deleteCartItem(@PathVariable Long id) {
			cartService.deleteCartItem(id);
	}


}
