package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.InventoryItemField;
import com.ecommerce.backend.entity.InventoryItemFieldChecklist;
import com.ecommerce.backend.entity.InventoryItemFieldColorPicker;
import com.ecommerce.backend.entity.InventoryItemFieldRadioGroup;
import com.ecommerce.backend.service.InventoryItemFieldService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/server/inventory-item-field")
@RequiredArgsConstructor
public class InventoryItemFieldController {
    private final InventoryItemFieldService inventoryItemFieldService;

    @GetMapping("/fields")
    public List<InventoryItemField> getAllExistingFields() {
        return inventoryItemFieldService.getAll();
    }

    @PostMapping("/radio-group")
    @PreAuthorize("hasRole('ADMIN')")
    public InventoryItemFieldRadioGroup createRadioGroup(
        @RequestBody InventoryItemFieldRadioGroup submitted) {
        return inventoryItemFieldService.save(submitted);
    }

    @PostMapping("/dropdown")
    @PreAuthorize("hasRole('ADMIN')")
    public InventoryItemFieldChecklist createChecklist(
        @RequestBody InventoryItemFieldChecklist submitted) {
        return inventoryItemFieldService.save(submitted);
    }

    @PostMapping("/stl")
    @PreAuthorize("hasRole('ADMIN')")
    public InventoryItemFieldColorPicker createColorPicker(
        @RequestBody InventoryItemFieldColorPicker submitted) {
        return inventoryItemFieldService.save(submitted);
    }
}
