package com.ecommerce.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;

import com.goshippo.shippo_sdk.models.components.DistanceUnitEnum;
import com.goshippo.shippo_sdk.models.components.WeightUnitEnum;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * A reusable parcel size (dimensions + weight) for quoting/booking Shippo
 * shipments. Kept as its own table rather than columns on Shipping, and
 * shared across many Shipping rows via Shipping.parcel, so a known size can
 * be looked up and reused instead of a new row being created every time -
 * see ShippingParcelRepository.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Data
@Entity
@Table(name = "shippingParcel")
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ShippingParcel {

	/**
	 * Standard box sizes for an actual outgoing shipment - deliberately a
	 * separate, wider-ranging set from InventoryItem.SizeCategory, since one
	 * box can hold many items combined and so may need to be larger than any
	 * single item's own size category. Centimeters, length x width x height.
	 */
	public enum SizeCategory {
		SMALL(20, 15, 10),
		MEDIUM(30, 23, 15),
		LARGE(40, 30, 20),
		EXTRA_LARGE(50, 40, 30),
		JUMBO(60, 45, 40);

		public final int lengthCm;
		public final int widthCm;
		public final int heightCm;

		SizeCategory(int lengthCm, int widthCm, int heightCm) {
			this.lengthCm = lengthCm;
			this.widthCm = widthCm;
			this.heightCm = heightCm;
		}
	}

	/**
	 * Weight tiers for an actual outgoing shipment - same reasoning as
	 * SizeCategory above, a combined box of several items can weigh more
	 * than any single item's WeightCategory.
	 */
	public enum WeightCategory {
		LIGHT(500),
		MEDIUM(1500),
		HEAVY(4000),
		EXTRA_HEAVY(8000),
		BULK(15000);

		public final int grams;

		WeightCategory(int grams) {
			this.grams = grams;
		}
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@CreationTimestamp
	private LocalDateTime createdAt;

	@NonNull @Column(nullable = false) private Long height;
	@NonNull @Column(nullable = false) private Long width;
	@NonNull @Column(nullable = false) private Long length;
	@NonNull @Column(nullable = false) private Long weight;

	@NonNull
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private WeightUnitEnum weightUnit;

	@NonNull
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private DistanceUnitEnum distanceUnit;
}
