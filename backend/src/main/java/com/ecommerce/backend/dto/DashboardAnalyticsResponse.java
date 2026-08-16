package com.ecommerce.backend.dto;

import java.util.List;

/**
 * Aggregated admin dashboard + analytics metrics, computed server-side so
 * the frontend doesn't need to ship full inventory/order/user tables to the
 * browser just to compute counts and time series.
 */
public record DashboardAnalyticsResponse(
		// Home page metrics
		long inventoryActiveCount,
		long inventoryArchivedCount,
		long totalSessions,
		long activeSessions,
		long uniqueSessionUsers,
		long totalAccounts,
		Integer sessionGrowthRatePercent,
		List<DailyMetric> sessionsByDate,

		// Analytics page metrics
		long totalRevenueCents,
		long successfulOrderCount,
		long totalOrderCount,
		long registeredUserCount,
		int repeatPurchaseRatePercent,
		List<DailyMetric> revenueByDate,
		List<OrdersDailyMetric> ordersByDate,
		List<DailyMetric> registeredUsersByDate,
		List<PopularItem> popularItems) {
}
