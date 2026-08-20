package com.ecommerce.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.function.ToLongFunction;

import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.DailyMetric;
import com.ecommerce.backend.dto.DashboardAnalyticsResponse;
import com.ecommerce.backend.dto.OrdersDailyMetric;
import com.ecommerce.backend.dto.PopularItem;
import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.entity.OrderItem;
import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.repository.InventoryItemRepository;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.SessionRepository;
import com.ecommerce.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Aggregates admin-facing dashboard and analytics metrics server-side, so
 * the frontend consumes precomputed counts and time series instead of full
 * inventory/order/user table dumps.
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

	public static final int months = 12;
	public static final double scale = 100.0;
	public static final int maxPopularItems = 8;
	public static final int scaleInt = 100;

	private static final DateTimeFormatter DAY_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

	private final InventoryItemRepository inventoryItemRepository;
	private final OrderRepository orderRepository;
	private final UserRepository userRepository;
	private final SessionRepository sessionRepository;


	/**
	 * Builds the full set of metrics behind both the admin dashboard home page
	 * and the analytics page.
	 *
	 * @return the aggregated metrics
	 */
	public DashboardAnalyticsResponse getDashboardAnalytics() {
		List<InventoryItem> inventory = inventoryItemRepository.findAll();
		List<Orders> orders = orderRepository.findAll();
		List<Users> users = userRepository.findAll();
		List<Sessions> sessions = sessionRepository.findAll();

		long inventoryArchivedCount = inventory.stream()
				.filter(item -> Boolean.TRUE.equals(item.getIsArchived()))
				.count();
		long inventoryActiveCount = inventory.size() - inventoryArchivedCount;

		long activeSessions = sessions.stream()
				.filter(s -> s.getExpiresAt() != null && s.getExpiresAt().isAfter(LocalDateTime.now()))
				.count();
		long uniqueSessionUsers = sessions.stream()
				.map(Sessions::getUser)
				.filter(user -> user != null)
				.map(Users::getId)
				.distinct()
				.count();

		List<DailyMetric> sessionsByDate = bucketCountByDate(sessions, Sessions::getCreatedAt);
		Integer sessionGrowthRatePercent = computeGrowthRate(
				sessions.stream().map(Sessions::getCreatedAt).toList());

		List<Orders> successfulOrders = orders.stream()
				.filter(this::isSuccessful)
				.toList();

		long totalRevenueCents = successfulOrders.stream()
				.mapToLong(order -> order.getTotal() != null ? order.getTotal() : 0L)
				.sum();

		List<Users> registeredUsers = users.stream()
				.filter(user -> user.getUserRole() == Users.Role.REGISTERED)
				.toList();

		return new DashboardAnalyticsResponse(
				inventoryActiveCount,
				inventoryArchivedCount,
				sessions.size(),
				activeSessions,
				uniqueSessionUsers,
				users.size(),
				sessionGrowthRatePercent,
				sessionsByDate,
				totalRevenueCents,
				successfulOrders.size(),
				orders.size(),
				registeredUsers.size(),
				computeRepeatPurchaseRate(successfulOrders),
				bucketSumByDate(successfulOrders, Orders::getDate,
						order -> order.getTotal() != null ? order.getTotal() : 0L),
				bucketOrdersByDate(orders),
				bucketCountByDate(registeredUsers, Users::getCreatedAt),
				computePopularItems(orders));
	}

	private boolean isSuccessful(Orders order) {
		return order.getStatus() == Orders.Status.COMPLETED || order.getStatus() == Orders.Status.PAID;
	}

	private <T> List<DailyMetric> bucketCountByDate(List<T> items, Function<T, LocalDateTime> dateFn) {
		return bucketSumByDate(items, dateFn, item -> 1L);
	}

	private <T> List<DailyMetric> bucketSumByDate(
			List<T> items, Function<T, LocalDateTime> dateFn, ToLongFunction<T> valueFn) {
		Map<String, Long> sums = new LinkedHashMap<>();
		for (T item : items) {
			LocalDateTime date = dateFn.apply(item);
			if (date == null) continue;
			sums.merge(date.format(DAY_FORMAT), valueFn.applyAsLong(item), Long::sum);
		}
		return sums.entrySet().stream()
				.map(entry -> new DailyMetric(entry.getKey(), entry.getValue()))
				.sorted(Comparator.comparing(DailyMetric::date))
				.toList();
	}

	private List<OrdersDailyMetric> bucketOrdersByDate(List<Orders> orders) {
		// index 0 = total orders that day, index 1 = completed orders that day
		Map<String, long[]> counts = new LinkedHashMap<>();
		for (Orders order : orders) {
			if (order.getDate() == null) continue;
			long[] bucket = counts.computeIfAbsent(order.getDate().format(DAY_FORMAT), day -> new long[2]);
			bucket[0]++;
			if (isSuccessful(order)) bucket[1]++;
		}
		return counts.entrySet().stream()
				.map(entry -> new OrdersDailyMetric(entry.getKey(), entry.getValue()[0], entry.getValue()[1]))
				.sorted(Comparator.comparing(OrdersDailyMetric::date))
				.toList();
	}

	private List<PopularItem> computePopularItems(List<Orders> orders) {
		Map<String, Long> quantityByTitle = new LinkedHashMap<>();
		for (Orders order : orders) {
			List<OrderItem> items = order.getItems();
			if (items == null) continue;
			for (OrderItem item : items) {
				if (item.getItemTitle() == null) continue;
				long quantity = item.getQuantity() != null ? item.getQuantity() : 0;
				quantityByTitle.merge(item.getItemTitle(), quantity, Long::sum);
			}
		}
		return quantityByTitle.entrySet().stream()
				.sorted(Map.Entry.<String, Long>comparingByValue().reversed())
				.limit(maxPopularItems)
				.map(entry -> new PopularItem(entry.getKey(), entry.getValue()))
				.toList();
	}

	/**
	 * Percentage of customers (by email) with more than one successful order -
	 * a simple proxy for retention until real cohort tracking exists.
	 */
	private int computeRepeatPurchaseRate(List<Orders> successfulOrders) {
		Map<String, Long> ordersPerCustomer = new LinkedHashMap<>();
		for (Orders order : successfulOrders) {
			String email = order.getUser() != null ? order.getUser().getEmail() : order.getEmail();
			if (email == null) continue;
			ordersPerCustomer.merge(email, 1L, Long::sum);
		}
		if (ordersPerCustomer.isEmpty()) return 0;
		long repeatCustomers = ordersPerCustomer.values().stream().filter(count -> count > 1).count();
		return (int) Math.round((repeatCustomers * scale) / ordersPerCustomer.size());
	}

	/**
	 * Month-over-month session growth rate - mirrors the calculation that
	 * previously lived client-side in DashboardProvider.
	 */
	private Integer computeGrowthRate(List<LocalDateTime> sessionDates) {
		if (sessionDates.isEmpty()) return null;
		LocalDate now = LocalDate.now();
		int thisMonth = now.getMonthValue();
		int thisYear = now.getYear();
		int prevMonth = thisMonth == 1 ? months : thisMonth - 1;
		int prevYear = thisMonth == 1 ? thisYear - 1 : thisYear;

		long current = sessionDates.stream()
				.filter(date -> date.getMonthValue() == thisMonth && date.getYear() == thisYear)
				.count();
		long previous = sessionDates.stream()
				.filter(date -> date.getMonthValue() == prevMonth && date.getYear() == prevYear)
				.count();

		if (previous == 0) return current > 0 ? scaleInt : 0;
		return (int) Math.round(((current - previous) / (double) previous) * scaleInt);
	}
}
