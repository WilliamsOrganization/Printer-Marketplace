package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.CreateCatalogRequest;
import com.ecommerce.backend.dto.CreateCatalogResponse;
import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.repository.InventoryItemRepository;
import com.ecommerce.backend.service.StripeCatalogService;
import com.stripe.exception.StripeException;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
// import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

/**
 * REST controller for product inventory operations.
 */

@Slf4j
@RestController
@RequestMapping("/server/inventoryitem")
@RequiredArgsConstructor
public class InventoryItemController {
	private final StripeCatalogService stripeCatalogService;
	private final InventoryItemRepository inventoryItemRepository;
	private final S3Client s3Client;

	@Value("${aws.s3.bucket}")
	private String bucket;

	@GetMapping
	public List<InventoryItem> getAll() {
		return inventoryItemRepository.findAll(
				Sort.by(Sort.Direction.ASC, "id"));
	}

	@GetMapping("/{id}")
	public InventoryItem getOne(@PathVariable Long id) {
		return inventoryItemRepository.findById(id).orElseThrow();
	}

	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public InventoryItem create(@RequestBody InventoryItem inventoryitem) {
		InventoryItem item = inventoryItemRepository.save(inventoryitem);

		CreateCatalogRequest createCatalogRequest = new CreateCatalogRequest(
				item.getItemTitle(), item.getItemDescription(),
				List.of(item.getImageUrls()), item.getItemCost(),
				item.getCurrency(), item.getQuantity());

		try {
			CreateCatalogResponse stripeResponse = stripeCatalogService.createProductAndPrice(
					createCatalogRequest);
			item.setStripePriceId(stripeResponse.stripePriceId());
			item.setStripeProductId(stripeResponse.stripeProductId());
			log.info("Stripe Item was created");
			return inventoryItemRepository.save(item);
		} catch (StripeException e) {
			log.error("Stripe Item was not created: " + e.getMessage());
		}
		return item;
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public InventoryItem update(@PathVariable Long id,
			@RequestBody InventoryItem updated) {
		InventoryItem existing = inventoryItemRepository.findById(id).orElseThrow();
		existing.setItemTitle(updated.getItemTitle());
		existing.setItemDescription(updated.getItemDescription());
		existing.setItemCost(updated.getItemCost());
		existing.setImageUrls(updated.getImageUrls());
		existing.setQuantity(updated.getQuantity());
		existing.setCurrency(updated.getCurrency());
		existing.setCategory(updated.getCategory());
		existing.setBadge(updated.getBadge());
		existing.setSale(updated.getSale());
		return inventoryItemRepository.save(existing);
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<String> delete(@PathVariable Long id) {
		InventoryItem item = inventoryItemRepository.findById(id).orElse(null);
		if (item == null) {
			log.warn("Delete requested for non-existent item id: {}", id);
			return ResponseEntity.notFound().build();
		}
		try {
			boolean deleted = stripeCatalogService.deleteProduct(item.getStripeProductId());
			inventoryItemRepository.deleteById(id);
			if (deleted) {
				log.info("Stripe product {} deleted", item.getStripeProductId());
				return ResponseEntity.ok("deleted");
			}
			log.info("Stripe product {} archived (has prior prices)", item.getStripeProductId());
			return ResponseEntity.ok("archived");
		} catch (StripeException e) {
			log.error("Stripe failed to delete item {}: {}", item.getStripeProductId(), e.getMessage());
			return ResponseEntity.internalServerError().body("stripe_error");
		}
	}

	// TODO: this shouldnt be hit when no images are attached.
	@PostMapping("/images")
	public List<String> uploadImages(@RequestParam("images") List<MultipartFile> files) {
		// TODO : set up S3 Url for images
		return files.stream()
				.map(file -> {
					String key = "public/products/" + UUID.randomUUID() + "-" +
							file.getOriginalFilename().replaceAll("\\s+", "-");
					try {
						s3Client.putObject(
								PutObjectRequest.builder()
										.bucket(bucket)
										.key(key)
										.contentType(file.getContentType())
										.build(),
								software.amazon.awssdk.core.sync.RequestBody
										.fromInputStream(file.getInputStream(),
												file.getSize()));
					} catch (IOException e) {
						throw new RuntimeException(
								"Failed to upload " + file.getOriginalFilename(), e);
					}
					return "https://" + bucket + ".s3.amazonaws.com/" + key;
				})
				.toList();
	}
}
