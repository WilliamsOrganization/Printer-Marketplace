package com.ecommerce.backend.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.backend.dto.CreateCatalogRequest;
import com.ecommerce.backend.dto.CreateCatalogResponse;
import com.ecommerce.backend.dto.EditCatalogRequest;
import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.repository.InventoryItemRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Product;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.exception.SdkException;

/**
 * InventoryItemService handles all operations on inventory items, including
 * creation, editing, and deletion.
 */	
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryItemService {
	private final InventoryItemRepository inventoryItemRepository;
	private final StripeCatalogService stripeCatalogService;
	private final S3Service s3Service;

	/**
	 * Outcome of a delete request - lets the controller decide the HTTP
	 * status/body without needing to know how the deletion was actually
	 * carried out.
	 */
	public enum DeleteOutcome {
		NOT_FOUND, DELETED, ARCHIVED, STRIPE_ERROR, S3_ERROR
	}

	/**
	 * Gets every non-archived inventory item.
	 *
	 * @return the list of inventory items
	 */
	public List<InventoryItem> getAll() {
		return inventoryItemRepository.findByIsArchivedFalse(Sort.by(Sort.Direction.ASC, "id"));
	}

	/**
	 * Gets every inventory item, including archived ones.
	 *
	 * @return the list of inventory items
	 */
	public List<InventoryItem> getAllAdmin() {
		return inventoryItemRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
	}

	/**
	 * Gets a single inventory item by id.
	 *
	 * @param id the item's id
	 * @return the item
	 */
	public InventoryItem getOne(Long id) {
		return inventoryItemRepository.findById(id).orElseThrow();
	}

	/**
	 * Single entry point for creating or updating an inventory item: if the
	 * submitted item carries an id that already exists, it's treated as an
	 * update; otherwise a new item (and matching Stripe product/price) is
	 * created. Lets the frontend use one form/dialog for both flows instead
	 * of maintaining separate create and edit paths.
	 *
	 * @param submitted the item to create or update
	 * @return the saved item
	 * @throws StripeException if the Stripe product/price call fails
	 */
	public InventoryItem save(InventoryItem submitted) throws StripeException {
		if (submitted.getId() != null && inventoryItemRepository.existsById(submitted.getId())) {
			return update(submitted);
		}
		return create(submitted);
	}

	private InventoryItem create(InventoryItem submitted) throws StripeException {
		CreateCatalogRequest createCatalogRequest = new CreateCatalogRequest(
				submitted.getItemTitle(), submitted.getItemDescription(),
				List.of(submitted.getImageUrls()), submitted.getItemCost(),
				submitted.getCurrency(), submitted.getQuantity());

		CreateCatalogResponse stripeResponse = stripeCatalogService.createProductAndPrice(createCatalogRequest);
		submitted.setStripePriceId(stripeResponse.stripePriceId());
		submitted.setStripeProductId(stripeResponse.stripeProductId());
		log.info("Stripe Item was created");
		return inventoryItemRepository.save(submitted);
	}

	private InventoryItem update(InventoryItem submitted) throws StripeException {
		InventoryItem existing = inventoryItemRepository.findById(submitted.getId()).orElseThrow();

		EditCatalogRequest editReq = new EditCatalogRequest(
				submitted.getItemTitle(), submitted.getItemDescription(),
				submitted.getImageUrls() != null ? List.of(submitted.getImageUrls()) : null,
				submitted.getItemCost(), submitted.getCurrency());
		Product stripeProduct = stripeCatalogService.editProduct(existing.getStripeProductId(), editReq);
		existing.setStripePriceId(stripeProduct.getDefaultPrice());

		// Diff against existing's still-current imageUrls before it gets
		// overwritten below, so whatever the admin removed in this edit
		// actually gets deleted from S3 instead of just dropped from the row.
		s3Service.updateImages(submitted.getImageUrls(), existing);

		existing.setItemTitle(submitted.getItemTitle());
		existing.setItemDescription(submitted.getItemDescription());
		existing.setItemCost(submitted.getItemCost());
		existing.setImageUrls(submitted.getImageUrls());
		existing.setQuantity(submitted.getQuantity());
		existing.setCurrency(submitted.getCurrency());
		existing.setSizeCategory(submitted.getSizeCategory());
		existing.setWeightCategory(submitted.getWeightCategory());
		existing.setSale(submitted.getSale());

		return inventoryItemRepository.save(existing);
	}

	/**
	 * Deletes an item's Stripe product; if Stripe refuses because the
	 * product has prior usage, the item is archived instead of deleted.
	 *
	 * @param id the item's id
	 * @return how the delete was actually resolved
	 */
	public DeleteOutcome delete(Long id) {
		InventoryItem item = inventoryItemRepository.findById(id).orElse(null);
		if (item == null) {
			log.warn("Delete requested for non-existent item id: {}", id);
			return DeleteOutcome.NOT_FOUND;
		}
		try {
			boolean deleted = stripeCatalogService.deleteProduct(item.getStripeProductId());
			if (deleted) {
				// Row first - if S3 cleanup fails afterward, worst case is
				// an orphaned file in the bucket, not a deleted image still
				// referenced by a row that's supposed to be gone.
				inventoryItemRepository.deleteById(id);
				s3Service.deleteImages(item);
				log.info("Stripe product {} deleted", item.getStripeProductId());
				return DeleteOutcome.DELETED;
			}
			item.setIsArchived(true);
			inventoryItemRepository.save(item);
			log.info("Stripe product {} archived, inventory item {} marked archived", item.getStripeProductId(), id);
			return DeleteOutcome.ARCHIVED;
		} catch (StripeException e) {
			log.error("Stripe failed to delete item {}: {}", item.getStripeProductId(), e.getMessage());
			return DeleteOutcome.STRIPE_ERROR;
		} catch (SdkException e) {
			log.error("S3 failed to delete item {}: {}", item.getStripeProductId(), e.getMessage());
			return DeleteOutcome.S3_ERROR;
		}

	}

	/**
	 * Toggles an item's archived state directly, syncing Stripe's product
	 * active flag to match.
	 *
	 * @param id       the item's id
	 * @param archived the archived state to set
	 * @return the updated item
	 */
	public InventoryItem setArchived(Long id, boolean archived) throws StripeException {
		InventoryItem item = inventoryItemRepository.findById(id).orElseThrow();
		if (archived) {
			stripeCatalogService.deactivateProduct(item.getStripeProductId());
		} else {
			stripeCatalogService.activateProduct(item.getStripeProductId());
		}
		item.setIsArchived(archived);
		return inventoryItemRepository.save(item);
	}

	/**
	 * Uploads images to S3 and returns their URLs.
	 *
	 * @param files the images to upload
	 * @return the S3 URLs
	 */
	public List<String> uploadImages(List<MultipartFile> files) {
		return s3Service.uploadImages(files);
	}
}
