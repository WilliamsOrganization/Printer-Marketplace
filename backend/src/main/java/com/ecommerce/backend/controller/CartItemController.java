package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.repository.CartItemRepository;
import java.util.List;
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
@RestController
@RequestMapping("/server/CartItem")
public class CartItemController {
	private final CartItemRepository repository;

	public CartItemController(CartItemRepository repository) {
		this.repository = repository;
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
	public CartItem create(@RequestBody CartItem cartItem) {
		// TODO: process POST request
		return repository.save(cartItem);
	}

	@DeleteMapping("/{id}")

	public void delete(@PathVariable Long id) {
		// TODO: process POST request
		repository.deleteById(id);
	}
}
