package com.ecommerce.backend.dto;

/**
 * An inventory item title and the total quantity sold across all orders.
 */
public record PopularItem(String itemTitle, long quantity) {
}
