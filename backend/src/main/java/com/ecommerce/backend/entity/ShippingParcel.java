package com.ecommerce.backend.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.goshippo.shippo_sdk.models.components.DistanceUnitEnum;
import com.goshippo.shippo_sdk.models.components.WeightUnitEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

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
