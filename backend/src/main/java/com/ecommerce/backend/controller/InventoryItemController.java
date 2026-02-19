package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.repository.InventoryItemRepository;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for product inventory operations.
 */
@RestController
@RequestMapping("/server/inventoryitem")
public class InventoryItemController {
	private final InventoryItemRepository repository;

	public InventoryItemController(InventoryItemRepository repository) {
		this.repository = repository;
	}

	// TODO: protect this field maybe
	@GetMapping
	public List<InventoryItem> getAll() {
		return repository.findAll();
	}

	@GetMapping("/{id}")
	public InventoryItem getOne(@PathVariable Long id) {
		return repository.findById(id).orElseThrow();
	}

	@PostMapping
	public InventoryItem create(@RequestBody InventoryItem inventoryitem) {
		// TODO: process POST request
		return repository.save(inventoryitem);
	}

	@DeleteMapping("/{id}")

	public void delete(@PathVariable Long id) {
		// TODO: process POST request
		repository.deleteById(id);
	}

	// TODO: big todo to create the upload image route for the item creation form







}
