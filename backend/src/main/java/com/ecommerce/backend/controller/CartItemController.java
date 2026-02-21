package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AddCartItemRequest;
import com.ecommerce.backend.dto.AddCartItemResponse;
import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.repository.CartItemRepository;
import com.ecommerce.backend.service.CartService;
import com.sun.org.slf4j.internal.Logger;
import com.sun.org.slf4j.internal.LoggerFactory;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for cart item operations.
 */
@Slf4j
@RestController
@RequestMapping("/server/cartitem")
public class CartItemController {
	private final CartItemRepository repository;
	private final CartService cartService;

	public CartItemController(CartItemRepository repository,
			CartService cartService) {
		this.repository = repository;
		this.cartService = cartService;
	}

	@GetMapping
	public List<CartItem> getAll() {
		return repository.findAll();
	}

	@GetMapping("/{id}")
	public CartItem getOne(@PathVariable Long id) {
		return repository.findById(id).orElseThrow();
	}

	@PostMapping
	public AddCartItemResponse create(@RequestBody AddCartItemRequest request,
			HttpServletResponse response) {
		AddCartItemResponse result = this.cartService.createCartItem(request);
		if (result.getSessionToken() != null) {
			Cookie cookie = new Cookie("session_token", result.getSessionToken());
			cookie.setHttpOnly(true);
			cookie.setPath("/");
			cookie.setMaxAge(30 * 24 * 60 * 60);
			response.addCookie(cookie);
		} else {
			log.info("No Session token was created or assigned");
		}
		return result;
	}

	@DeleteMapping("/{id}")

	public void delete(@PathVariable Long id) {
		repository.deleteById(id);
	}
}
