package com.ecommerce.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.dto.DashboardAnalyticsResponse;
import com.ecommerce.backend.service.AnalyticsService;

import lombok.RequiredArgsConstructor;

/**
 * Admin-only aggregated metrics behind the dashboard home page and the
 * analytics page.
 */
@RestController
@RequestMapping("/server/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
	private final AnalyticsService analyticsService;

	/**
	 * Main route for the dashboard analytics page.
	 * 
	 * @return {@link DashboardAnalyticsResponse}
	 */
	@GetMapping("/dashboard")
	@PreAuthorize("hasRole('ADMIN')")
	public DashboardAnalyticsResponse getDashboardAnalytics() {
		return analyticsService.getDashboardAnalytics();
	}
}
