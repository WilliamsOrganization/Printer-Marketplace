package com.ecommerce.backend.dto;

/**
 * A single count/sum bucketed by calendar day (yyyy-MM-dd).
 */
public record DailyMetric(String date, long value) {
}
