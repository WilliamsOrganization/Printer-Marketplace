package com.ecommerce.backend.dto;

import java.util.List;

import com.ecommerce.backend.entity.InventoryItemFieldOptionsStlColor;

public record InventoryItemFieldColorPickerBody(
	String label,
	String description,
	List<InventoryItemFieldOptionsStlColor> options
) {
}
