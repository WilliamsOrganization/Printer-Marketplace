/* (C)2026 */
package com.ecommerce.backend.dto;

import java.util.List;

/**
 * AddCartItemRequest
 */
public record AddCartItemRequest(Long itemId, Integer quantity,
		List<InventoryItemFieldSelection> inventoryFieldItemSelections) {
};
