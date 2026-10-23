/* (C)2026 */
package com.ecommerce.backend.dto;

import java.util.List;

import com.ecommerce.backend.entity.InventoryItemFieldOptionsDropdown;

public record InventoryItemFieldChecklistBody(String label, String description,
		List<InventoryItemFieldOptionsDropdown> options) {
}
