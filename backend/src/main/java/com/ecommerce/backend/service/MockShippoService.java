package com.ecommerce.backend.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Shipping;
import com.ecommerce.backend.entity.ShippingAddress;
import com.ecommerce.backend.repository.ShippingRepository;
import com.goshippo.shippo_sdk.models.components.TrackingStatusEnum;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Test-only tooling for exercising the real Shippo tracking webhook
 * locally, without waiting on a real carrier or standing up a tunnel for
 * Shippo to actually reach this app. Kept separate from ShippingService so
 * none of this test-only machinery is mixed in with real shipping logic.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MockShippoService {

	public static final int notFound = 404;
	private static final List<TrackingStatusEnum> MOCK_TRACKING_CYCLE =
			List.of(TrackingStatusEnum.PRE_TRANSIT, TrackingStatusEnum.TRANSIT, TrackingStatusEnum.DELIVERED);

	// A real, reliably-geocodable stand-in "in transit" waypoint - there's no
	// route/interpolation API involved, this is just something plausible to
	// exercise the real geocoding path with for the TRANSIT mock stage.
	private static final ShippingAddress MOCK_TRANSIT_WAYPOINT =
			ShippingAddress.builder().city("Winnipeg").state("MB").country("CA").build();

	private final ShippingRepository shippingRepository;
	private final ShippingService shippingService;
	private final HttpClient httpClient = HttpClient.newHttpClient();

	@Value("${frontend.url}")
	private String FRONTEND_URL;
	@Value("${server.port:8080}")
	private int serverPort;


	/**
	 * Advances a shipment one step through PRE_TRANSIT ("shipping") ->
	 * TRANSIT -> DELIVERED, looping back to PRE_TRANSIT, each time it's
	 * called. Rather than updating the row directly, this builds a real
	 * track_updated-shaped payload (using the shipment's real tracking
	 * number) and POSTs it to this app's own /server/shipping/webhook over
	 * local HTTP - so the actual webhook endpoint (JSON deserialization
	 * included) gets exercised, not just its handling logic in isolation.
	 *
	 * @param order the order whose (already-purchased) shipment to advance
	 * @return the updated shipment
	 */
	public Shipping advanceTracking(Orders order) throws Exception {
		Shipping shipping = order.getShipping();
		if (shipping.getTrackingNumber() == null) {
			throw new IllegalStateException(
					"Order " + order.getId() + " has no tracking number yet - create a label first");
		}

		int currentIndex = MOCK_TRACKING_CYCLE.stream()
				.filter(stage -> shippingService.mapTrackingStatus(stage)
						.map(s -> s == shipping.getStatus()).orElse(false))
				.findFirst()
				.map(MOCK_TRACKING_CYCLE::indexOf)
				.orElse(-1);
		TrackingStatusEnum next = MOCK_TRACKING_CYCLE.get((currentIndex + 1) % MOCK_TRACKING_CYCLE.size());

		ShippingAddress location = switch (next) {
			case PRE_TRANSIT -> shipping.getAddressFrom();
			case DELIVERED -> shipping.getAddressTo();
			default -> MOCK_TRANSIT_WAYPOINT;
		};

		String now = Instant.now().toString();
		String payload = """
				{
				  "event": "track_updated",
				  "test": true,
				  "data": {
				    "tracking_number": "%s",
				    "carrier": "usps",
				    "tracking_status": {
				      "object_id": "%s",
				      "object_created": "%s",
				      "object_updated": "%s",
				      "status": "%s",
				      "status_details": "Mock status update",
				      "location": { "city": "%s", "state": "%s", "country": "%s" }
				    },
				    "tracking_history": [],
				    "messages": []
				  }
				}
				""".formatted(shipping.getTrackingNumber(), UUID.randomUUID(), now, now, next.value(),
				location.getCity(), location.getState(), location.getCountry());

		HttpRequest request = HttpRequest.newBuilder()
				.uri(URI.create(FRONTEND_URL + "/server/shipping/webhook"))
				.header("Content-Type", "application/json")
				.POST(HttpRequest.BodyPublishers.ofString(payload))
				.build();
		HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
		if (response.statusCode() >= notFound) {
			throw new IllegalStateException(
					"Mock tracking webhook call failed: " + response.statusCode() + " " + response.body());
		}

		return shippingRepository.findById(shipping.getId()).orElseThrow();
	}
}
