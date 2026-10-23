/* (C)2026 */
package com.ecommerce.backend.dto;

import java.util.List;

/**
 * InventoryItemFieldSelection
 */
public record InventoryItemFieldSelection(Long fieldId, List<Long> optionIds) {
};
