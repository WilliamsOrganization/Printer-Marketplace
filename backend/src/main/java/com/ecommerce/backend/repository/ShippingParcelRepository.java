package com.ecommerce.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.ShippingParcel;
import com.goshippo.shippo_sdk.models.components.DistanceUnitEnum;
import com.goshippo.shippo_sdk.models.components.WeightUnitEnum;

/**
 * Data access for reusable ShippingParcel sizes.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
public interface ShippingParcelRepository extends JpaRepository<ShippingParcel, Long> {

	/**
	 * Finds an existing parcel with these exact dimensions, if one exists,
	 * so callers can reuse it instead of creating a duplicate - e.g.
	 * {@code repo.findByHeightAndWidthAndLengthAndWeightAndWeightUnitAndDistanceUnit(...)
	 * .orElseGet(() -> repo.save(newParcel))}.
	 */
	Optional<ShippingParcel> findByHeightAndWidthAndLengthAndWeightAndWeightUnitAndDistanceUnit(
			Long height, Long width, Long length, Long weight,
			WeightUnitEnum weightUnit, DistanceUnitEnum distanceUnit);
}
