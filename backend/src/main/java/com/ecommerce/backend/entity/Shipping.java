package com.ecommerce.backend.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * Shipping
 * TODO: this needs to be refactored to match the Shippo API documentation
 * https://docs.goshippo.com/docs/guides_general/generate_shipping_label
 * we need an Address/Shipment/Parcels/Transaction set of objects not one single "shipping" table
 * read the documentation you pussy. write down constraints.
 */
@Data
@Entity
@Table(name = "shipping")
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // for JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Shipping {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@CreationTimestamp
	private LocalDateTime createdAt;

	@OneToOne
	@JoinColumn(name = "orders_id", nullable = false)
	@NotNull
	@NonNull
	private Orders orders;

	// TODO: consider @PositiveOrZero
	private Long shippingCost;
	private String serviceType;
	private String easyPostId;
	private String trackingNumber;
	private String trackingUrl;
	private String labelPdfUrl;
	// address info
	private String name;
	private String addressLine1;
	private String addressLine2;
	private String city;
	private String province;
	// TODO: consider @Pattern for postal/zip code format
	private String postalCode;
	private String country;

	@NotNull
	@NonNull
	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private Status status;

	public enum Status {
		PENDING, PURCHASED, IN_TRANSIT, DELIVERED
	}

}
