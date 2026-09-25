package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.InventoryItemFieldChecklist;

@Repository
public interface InventoryItemFieldChecklistRepository extends JpaRepository<InventoryItemFieldChecklist, Long> {


}
