package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.InventoryItemFieldColorPicker;

@Repository
public interface InventoryItemFieldColorPickerRepository extends JpaRepository<InventoryItemFieldColorPicker, Long> {


}
