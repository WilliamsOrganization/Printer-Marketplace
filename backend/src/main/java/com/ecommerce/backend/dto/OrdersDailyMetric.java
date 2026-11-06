package com.ecommerce.backend.dto;

/**
 * Orders placed vs. successfully completed (COMPLETED/PAID), bucketed by
 * calendar day (yyyy-MM-dd).
 */
public record OrdersDailyMetric(String date, long totalOrders, long completedOrders) {
}
