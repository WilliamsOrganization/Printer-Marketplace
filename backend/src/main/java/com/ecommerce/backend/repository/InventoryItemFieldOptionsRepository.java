/* (C)2026 */
package com.ecommerce.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.InventoryItemField;
import com.ecommerce.backend.entity.InventoryItemFieldOptions;

@Repository
public interface InventoryItemFieldOptionsRepository extends JpaRepository<InventoryItemFieldOptions, Long> {
	List<InventoryItemFieldOptions> findByIdInAndInventoryItemField(List<Long> ids,
			InventoryItemField inventoryItemField);
}
