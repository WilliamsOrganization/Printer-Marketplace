package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.InventoryItemField;
import com.ecommerce.backend.repository.InventoryItemFieldRepository;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class InventoryItemFieldService {
    private final InventoryItemFieldRepository inventoryItemFieldRepository;

    public List<InventoryItemField> getAll() {
        return inventoryItemFieldRepository.findAll();
    }

    public <T extends InventoryItemField> T save(T field) {
        return inventoryItemFieldRepository.save(field);
    }

    /**
     * Resolves a list of field IDs into managed entities.
     */
    public List<InventoryItemField> resolveFields(List<Long> fieldIds) {
        if (fieldIds == null || fieldIds.isEmpty()) {
            return Collections.emptyList();
        }
        return inventoryItemFieldRepository.findAllById(fieldIds);
    }
}
