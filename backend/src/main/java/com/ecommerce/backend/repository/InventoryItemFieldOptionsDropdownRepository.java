package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.InventoryItemFieldOptionsDropdown;

@Repository
public interface InventoryItemFieldOptionsDropdownRepository extends JpaRepository<InventoryItemFieldOptionsDropdown, Long> {


}
