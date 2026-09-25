package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.InventoryItemFieldRadioGroup;

@Repository
public interface InventoryItemFieldRadioGroupRepository extends JpaRepository<InventoryItemFieldRadioGroup, Long> {


}
