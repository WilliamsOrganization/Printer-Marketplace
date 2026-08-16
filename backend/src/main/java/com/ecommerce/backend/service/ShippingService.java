package com.ecommerce.backend.service;

import org.springframework.stereotype.Service;

import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.entity.Shipping;
import com.ecommerce.backend.entity.ShippingParcel;
import com.ecommerce.backend.repository.ShippingParcelRepository;
import com.ecommerce.backend.repository.ShippingRepository;
import com.goshippo.shippo_sdk.models.components.DistanceUnitEnum;
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
}
