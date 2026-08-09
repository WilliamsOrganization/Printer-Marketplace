package com.ecommerce.backend.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
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
	@JsonBackReference
	private Orders orders;

	// TODO: consider @PositiveOrZero
	private Long shippingCost;
	private String serviceType;
	private String easyPostId;
	private String trackingNumber;
	private String trackingUrl;
	private String labelPdfUrl;

	@Embedded
	@AttributeOverrides({
			@AttributeOverride(name = "name", column = @Column(name = "from_name")),
			@AttributeOverride(name = "street1", column = @Column(name = "from_street1")),
			@AttributeOverride(name = "street2", column = @Column(name = "from_street2")),
			@AttributeOverride(name = "city", column = @Column(name = "from_city")),
			@AttributeOverride(name = "state", column = @Column(name = "from_state")),
			@AttributeOverride(name = "zip", column = @Column(name = "from_zip")),
			@AttributeOverride(name = "country", column = @Column(name = "from_country")),
	})
	private ShippingAddress addressFrom;

	@Embedded
	@AttributeOverrides({
			@AttributeOverride(name = "name", column = @Column(name = "to_name")),
			@AttributeOverride(name = "street1", column = @Column(name = "to_street1")),
			@AttributeOverride(name = "street2", column = @Column(name = "to_street2")),
			@AttributeOverride(name = "city", column = @Column(name = "to_city")),
			@AttributeOverride(name = "state", column = @Column(name = "to_state")),
			@AttributeOverride(name = "zip", column = @Column(name = "to_zip")),
			@AttributeOverride(name = "country", column = @Column(name = "to_country")),
	})
	private ShippingAddress addressTo;

	@NotNull
	@NonNull
	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private Status status;

	public enum Status {
		PENDING, PURCHASED, IN_TRANSIT, DELIVERED
	}

}
