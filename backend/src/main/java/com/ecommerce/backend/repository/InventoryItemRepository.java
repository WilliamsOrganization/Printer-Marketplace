package com.ecommerce.backend.repository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.InventoryItem;


/**
 * Data access layer for InventoryItem entities.
 */
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
	List<InventoryItem> findByIsArchivedFalse(Sort sort);
}
