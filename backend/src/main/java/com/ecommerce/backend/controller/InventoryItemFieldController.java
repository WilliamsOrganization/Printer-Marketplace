/* (C)2026 */
package com.ecommerce.backend.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.entity.InventoryItemField;
import com.ecommerce.backend.entity.InventoryItemFieldChecklist;
import com.ecommerce.backend.entity.InventoryItemFieldRadioGroup;
import com.ecommerce.backend.entity.InventoryItemFieldThreeMFColorPicker;
import com.ecommerce.backend.service.InventoryItemFieldService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/server/inventory-item-field")
@RequiredArgsConstructor
public class InventoryItemFieldController {
	private final InventoryItemFieldService inventoryItemFieldService;

	@PostMapping("/dropdown")
	@PreAuthorize("hasRole('ADMIN')")
	public InventoryItemFieldChecklist createChecklist(@RequestBody InventoryItemFieldChecklist submitted) {
		return inventoryItemFieldService.save(submitted);
	}

	@PostMapping("/radio-group")
	@PreAuthorize("hasRole('ADMIN')")
	public InventoryItemFieldRadioGroup createRadioGroup(@RequestBody InventoryItemFieldRadioGroup submitted) {
		return inventoryItemFieldService.save(submitted);
	}

	@PostMapping("/three-mf")
	@PreAuthorize("hasRole('ADMIN')")
	public InventoryItemFieldThreeMFColorPicker createThreeMFColorPicker(
			@RequestBody InventoryItemFieldThreeMFColorPicker submitted) {
		return inventoryItemFieldService.save(submitted);
	}

	@GetMapping("/fields")
	public List<InventoryItemField> getAllExistingFields() {
		return inventoryItemFieldService.getAll();
	}
}
