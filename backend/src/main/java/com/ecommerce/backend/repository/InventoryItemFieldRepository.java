/* (C)2026 */
package com.ecommerce.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.entity.InventoryItemField;

/**
 * Repository for the InventoryItemField entity.
 * 
 * @author ewanchukwiliam
 */
@Repository
public interface InventoryItemFieldRepository extends JpaRepository<InventoryItemField, Long> {

	/**
	 * Finds a field by its id, scoped to the inventory item it belongs to.
	 * 
	 * @param id
	 *            the field id
	 * @param inventoryItem
	 *            the inventory item the field must belong to
	 * @return the field, if it exists on this item
	 */
	Optional<InventoryItemField> findByIdAndInventoryItem(Long id, InventoryItem inventoryItem);
}
