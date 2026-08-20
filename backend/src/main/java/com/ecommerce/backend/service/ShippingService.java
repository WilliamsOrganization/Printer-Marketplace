package com.ecommerce.backend.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.ShipmentFromValues;
import com.ecommerce.backend.dto.ShipmentToRequest;
import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Shipping;
import com.ecommerce.backend.entity.ShippingAddress;
import com.ecommerce.backend.entity.ShippingParcel;
import com.ecommerce.backend.exception.UnsupportedShippingDestination;
import com.ecommerce.backend.repository.ShippingParcelRepository;
import com.ecommerce.backend.repository.ShippingRepository;
import com.google.maps.errors.ApiException;
import com.google.maps.model.LatLng;
import com.goshippo.shippo_sdk.models.components.DistanceUnitEnum;
import com.goshippo.shippo_sdk.models.components.Rate;
import com.goshippo.shippo_sdk.models.components.Track;
import com.goshippo.shippo_sdk.models.components.TrackingStatusEnum;
import com.goshippo.shippo_sdk.models.components.Transaction;
import com.goshippo.shippo_sdk.models.components.TransactionStatusEnum;
import com.goshippo.shippo_sdk.models.components.WebhookPayloadTrack;
import com.goshippo.shippo_sdk.models.components.WeightUnitEnum;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Shipping Service that handles all shipping operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ShippingService {
    // Roughly a foot - the largest single package this rough estimate will
    // ever claim, regardless of how many items are in the cart.
    private static final long MAX_PACKAGE_HEIGHT_CM = 30;
    private static final long MIN_PACKAGE_HEIGHT_CM = 2;
    // Assumed stacked thickness per unit (e.g. one flat print) - deliberately
    // crude, this whole method is a checkout-time estimate, not a real
    // packing calculation.
    private static final long PER_UNIT_HEIGHT_CM = 1;

    private final ShippingParcelRepository shippingParcelRepository;
    private final ShippingRepository shippingRepository;
    private final ShippoService shippoService;
    private final GoogleMapsService googleMapsService;
    private final ResendService resendService;

    /**
     * Gets the existing ShippingParcel matching these exact dimensions, or
     * creates one if no match exists yet - so booking a shipment with a
     * size that's already been used reuses that row instead of minting a
     * duplicate.
     *
     * @author William Ewanchuk https://github.com/ewanchukwilliam
     */
    public ShippingParcel getOrCreateParcel(ShippingParcel parcel) {
        return shippingParcelRepository
            .findByHeightAndWidthAndLengthAndWeightAndWeightUnitAndDistanceUnit(
                parcel.getHeight(), parcel.getWidth(), parcel.getLength(), parcel.getWeight(),
                parcel.getWeightUnit(), parcel.getDistanceUnit())
            .orElseGet(() -> shippingParcelRepository.save(parcel));
    }

    /**
     * Estimates a single combined ShippingParcel for everything in a cart,
     * so multiple items can ship together in one package instead of each
     * needing its own. The footprint is bounded by the largest single
     * item's SizeCategory (not summed - items are assumed to fit
     * side-by-side within that footprint), height is a rough per-unit
     * stacking estimate capped around a foot, and weight is every item's
     * WeightCategory summed across quantity. Reuses a matching existing
     * parcel via getOrCreateParcel() rather than always creating a new row.
     *
     * @param cart the cart to estimate a combined parcel for
     * @return the estimated (persisted, possibly reused) parcel
     */
    public ShippingParcel estimateParcel(Cart cart) {
        int widthCm = 0;
        int lengthCm = 0;
        long totalUnits = 0;
        long totalGrams = 0;

        for (CartItem cartItem : cart.getItems()) {
            InventoryItem item = cartItem.getItem();
            widthCm = Math.max(widthCm, item.getSizeCategory().widthCm);
            lengthCm = Math.max(lengthCm, item.getSizeCategory().lengthCm);
            totalUnits += cartItem.getQuantity();
            totalGrams += (long) item.getWeightCategory().grams * cartItem.getQuantity();
        }

        long heightCm = Math.min(MAX_PACKAGE_HEIGHT_CM,
            Math.max(MIN_PACKAGE_HEIGHT_CM, totalUnits * PER_UNIT_HEIGHT_CM));

        ShippingParcel estimate = ShippingParcel.builder()
            .width((long) widthCm)
            .length((long) lengthCm)
            .height(heightCm)
            .weight(totalGrams)
            .weightUnit(WeightUnitEnum.G)
            .distanceUnit(DistanceUnitEnum.CM)
            .build();

        return getOrCreateParcel(estimate);
    }

    /**
     * Saves Shipping location address information
     *
     * @author William Ewanchuk https://github.com/ewanchukwilliam
     */
    public Shipping createShippingAddress(Shipping shipping){
		// TODO: validate this logic here
        return shippingRepository.save(shipping);
    }

	/**
	 * Purchases a shipping label for the given order's shipment, against the
	 * admin's chosen real-world box size/weight - not the estimated parcel
	 * quoted to the customer at checkout, since the actual box packed for
	 * fulfilment can end up a different size (see CreateShippingLabelRequest).
	 * That means a fresh rate has to be quoted for this real parcel first;
	 * the cheapest rate matching the originally-quoted service level is
	 * purchased, falling back to the cheapest rate overall if no match.
	 *
	 * TODO: re-host the label PDF in S3 instead of trusting Shippo's
	 * labelUrl to stay valid forever.
	 *
	 * @param order      the order to create a shipping label for
	 * @param lengthCm   the real box's length, in cm
	 * @param widthCm    the real box's width, in cm
	 * @param heightCm   the real box's height, in cm
	 * @param weightGrams the real box's weight, in grams
	 * @return the updated shipment
	 */
	public Shipping createShippingLabel(Orders order, Long lengthCm, Long widthCm, Long heightCm,
			Long weightGrams) throws UnsupportedShippingDestination, Exception {
		Shipping shipping = order.getShipping();

		ShippingParcel parcel = getOrCreateParcel(ShippingParcel.builder()
				.length(lengthCm)
				.width(widthCm)
				.height(heightCm)
				.weight(weightGrams)
				.weightUnit(WeightUnitEnum.G)
				.distanceUnit(DistanceUnitEnum.CM)
				.build());

		ShipmentToRequest to = ShipmentToRequest.builder()
				.name(shipping.getAddressTo().getName())
				.street1(shipping.getAddressTo().getStreet1())
				.street2(shipping.getAddressTo().getStreet2())
				.city(shipping.getAddressTo().getCity())
				.state(shipping.getAddressTo().getState())
				.zip(shipping.getAddressTo().getZip())
				.country(shipping.getAddressTo().getCountry())
				.phone(order.getUser().getPhoneNumber())
				.email(order.getEmail())
				.build();

		List<Rate> rates = shippoService.getShipmentRates(new ShipmentFromValues(), to, parcel);
		Rate chosen = rates.stream()
				.filter(rate -> rate.servicelevel().name().isPresent()
						&& rate.servicelevel().name().get().equalsIgnoreCase(shipping.getServiceType()))
				.findFirst()
				.orElseGet(() -> rates.stream()
						.min(Comparator.comparing(rate -> new BigDecimal(rate.amount())))
						.orElseThrow(() -> new IllegalStateException(
								"No shipping rates available for order " + order.getId())));

		Transaction transaction = shippoService.purchaseLabel(chosen.objectId());
		if (transaction.status().orElse(null) != TransactionStatusEnum.SUCCESS) {
			String reason = transaction.messages()
					.map(messages -> messages.stream()
							.map(message -> message.text().orElse(message.code().orElse("unknown error")))
							.collect(Collectors.joining("; ")))
					.orElse("no details returned");
			throw new UnsupportedShippingDestination(reason);
		}
		shipping.setTrackingNumber(transaction.trackingNumber().orElse(null));
		shipping.setTrackingUrl(transaction.trackingUrlProvider().orElse(null));
		shipping.setLabelPdfUrl(transaction.labelUrl().orElse(null));
		shipping.setActualShippingCost(toCents(chosen.amount()));
		shipping.setParcel(parcel);
		shipping.setStatus(Shipping.Status.PURCHASED);
		Shipping saved = shippingRepository.save(shipping);

		resendService.sendTrackingInformation(order.getUser(), order, saved);

		return saved;
	}

	private Long toCents(String amount) {
		return new BigDecimal(amount).movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValueExact();
	}

	/**
	 * Applies a Shippo track_updated webhook event: updates the shipment's
	 * status and last-known checkpoint (geocoded the same way addressTo is).
	 * Looks the shipment up by carrier tracking number, since that's all the
	 * webhook payload identifies it by.
	 *
	 * @param payload the webhook payload
	 * @return the updated shipment
	 */
	public Shipping applyTrackingUpdate(WebhookPayloadTrack payload) {
		Track track = payload.data()
				.orElseThrow(() -> new IllegalArgumentException("Webhook payload is missing track data"));
		Shipping shipping = shippingRepository.findByTrackingNumber(track.trackingNumber())
				.orElseThrow(() -> new IllegalStateException(
						"No shipment found for tracking number " + track.trackingNumber()));

		track.trackingStatus().ifPresent(trackingStatus -> {
			mapTrackingStatus(trackingStatus.status()).ifPresent(shipping::setStatus);

			trackingStatus.location().ifPresent(location -> {
				ShippingAddress current = ShippingAddress.builder()
						.city(location.city().orElse(null))
						.state(location.state().orElse(null))
						.country(location.country().orElse(null))
						.build();
				shipping.setCurrentLocation(current);

				LatLng geocoded = null;
				try {
					geocoded = googleMapsService.geocode(current);
				} catch (ApiException | InterruptedException | IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				if (geocoded != null) {
					shipping.setCurrentLat(geocoded.lat);
					shipping.setCurrentLng(geocoded.lng);
				}
			});
		});

		return shippingRepository.save(shipping);
	}

	// RETURNED/FAILURE/UNKNOWN have no equivalent in Shipping.Status yet, so
	// the status is left as whatever it already was for those - only the
	// location still gets updated for them.
	Optional<Shipping.Status> mapTrackingStatus(TrackingStatusEnum status) {
		return switch (status) {
			case PRE_TRANSIT -> Optional.of(Shipping.Status.PURCHASED);
			case TRANSIT -> Optional.of(Shipping.Status.IN_TRANSIT);
			case DELIVERED -> Optional.of(Shipping.Status.DELIVERED);
			default -> Optional.empty();
		};
	}
}
