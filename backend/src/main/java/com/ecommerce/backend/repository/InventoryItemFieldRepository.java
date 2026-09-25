package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.InventoryItemField;

/**
 * Repository for the InventoryItemField entity.
 * @author ewanchukwiliam
 */
@Repository
public interface InventoryItemFieldRepository extends JpaRepository<InventoryItemField, Long> {

}
