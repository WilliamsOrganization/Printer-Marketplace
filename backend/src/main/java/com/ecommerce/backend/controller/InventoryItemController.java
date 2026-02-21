package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.repository.InventoryItemRepository;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

	@GetMapping
	public List<InventoryItem> getAll() {
		return repository.findAll(Sort.by(Sort.Direction.ASC,"id"));
	}

	@GetMapping("/{id}")
	public InventoryItem getOne(@PathVariable Long id) {
		return repository.findById(id).orElseThrow();
	}

	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public InventoryItem create(@RequestBody InventoryItem inventoryitem) {
		// String[] imageUrls= new String[]{ "String","string","string" };
		// inventoryitem.setImageUrls(imageUrls);
		return repository.save(inventoryitem);
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public InventoryItem update(@PathVariable Long id,
			@RequestBody InventoryItem updated) {
		InventoryItem existing = repository.findById(id).orElseThrow();
		existing.setItemTitle(updated.getItemTitle());
		existing.setItemDescription(updated.getItemDescription());
		existing.setItemCost(updated.getItemCost());
		existing.setCategory(updated.getCategory());
		existing.setBadge(updated.getBadge());
		existing.setSale(updated.getSale());
		return repository.save(existing);
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public void delete(@PathVariable Long id) {
		repository.deleteById(id);
	}
	// TODO: big todo to create the upload image route for the item creation
	// form
}
