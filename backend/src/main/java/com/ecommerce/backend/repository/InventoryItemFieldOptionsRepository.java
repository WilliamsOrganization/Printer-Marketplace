package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.InventoryItemFieldOptions;

@Repository
public interface InventoryItemFieldOptionsRepository extends JpaRepository<InventoryItemFieldOptions, Long> {


}
