package com.ecommerce.backend.dto;

import com.ecommerce.backend.entity.InventoryItemFieldOptionsDropdown;
import java.util.List;

public record InventoryItemFieldChecklistBody(
	String label, 
	String description,
	List<InventoryItemFieldOptionsDropdown> options
) {
}
