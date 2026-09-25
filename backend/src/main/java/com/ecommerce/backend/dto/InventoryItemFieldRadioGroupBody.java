package com.ecommerce.backend.dto;

import java.util.List;

import com.ecommerce.backend.entity.InventoryItemFieldOptionsDropdown;

public record InventoryItemFieldRadioGroupBody(
	String label, 
	String description,
	List<InventoryItemFieldOptionsDropdown> options
) {


}
