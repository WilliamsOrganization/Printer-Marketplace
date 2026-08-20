package com.ecommerce.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.service.InventoryItemService;
import com.ecommerce.backend.service.InventoryItemService.DeleteOutcome;
import com.stripe.exception.StripeException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for product inventory operations. Routing and HTTP status
 * decisions only - the actual work happens in InventoryItemService.
 */
@Slf4j
@RestController
@RequestMapping("/server/inventoryitem")
@RequiredArgsConstructor
public class InventoryItemController {
	private final InventoryItemService inventoryItemService;

	/**
	 * Gets all inventory items.
	 *
	 * @return the inventory items
	 */
	@GetMapping
	public List<InventoryItem> getAll() {
		return inventoryItemService.getAll();
	}

	/**
	 * Gets all admin-only inventory items.
	 *
	 * @return the inventory items
	 */
	@GetMapping("/admin/all")
	@PreAuthorize("hasRole('ADMIN')")
	public List<InventoryItem> getAll_admin() {
		return inventoryItemService.getAllAdmin();
	}

	/**
	 * Gets an inventory item by ID.
	 *
	 * @param id the ID of the inventory item to get
	 * @return the inventory item
	 */	
	@GetMapping("/{id}")
	public InventoryItem getOne(@PathVariable Long id) {
		return inventoryItemService.getOne(id);
	}

	/**
	 * Single entry point for creating or updating an inventory item - see
	 * InventoryItemService.save() for how create vs. update is decided.
	 *
	 * @param submitted the item to create or update
	 * @return the saved item
	 * @throws StripeException if the Stripe product/price call fails
	 */
	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public InventoryItem save(@RequestBody InventoryItem submitted) throws StripeException {
		return inventoryItemService.save(submitted);
	}

	/**
	 * Archives or unarchives an inventory item.
	 *
	 * @param id the ID of the inventory item to archive
	 * @param archived whether to archive or unarchive the inventory item
	 * @return the archived inventory item
	 * @throws StripeException if the Stripe product/price call fails
	 */
	@PostMapping("/{id}/archive")
	@PreAuthorize("hasRole('ADMIN')")
	public InventoryItem setArchived(@PathVariable Long id, @RequestBody boolean archived) throws StripeException {
		return inventoryItemService.setArchived(id, archived);
	}

	/**
	 * Deletes an inventory item.
	 *
	 * @param id the ID of the inventory item to delete
	 * @return a response indicating whether the inventory item was deleted,
	 * unarchived, or not found
	 */
	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<String> delete(@PathVariable Long id) {
		DeleteOutcome outcome = inventoryItemService.delete(id);
		return switch (outcome) {
			case NOT_FOUND -> ResponseEntity.notFound().build();
			case DELETED -> ResponseEntity.ok("deleted");
			case ARCHIVED -> ResponseEntity.ok("archived");
			case STRIPE_ERROR -> ResponseEntity.internalServerError().body("stripe_error");
			case S3_ERROR -> ResponseEntity.internalServerError().body("s3_error");
		};
	}

	// TODO: Consider making this a frontend-direct upload, not a backend-direct upload.
	/**
	 * Uploads images to S3 and returns the S3 URLs.
	 *
	 * @param files the images to upload
	 * @return the S3 URLs
	 */
	@PostMapping("/images")
	public List<String> uploadImages(@RequestParam("images") List<MultipartFile> files) {
		return inventoryItemService.uploadImages(files);
	}
}
