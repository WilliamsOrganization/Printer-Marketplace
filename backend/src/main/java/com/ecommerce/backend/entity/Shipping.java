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
import jakarta.persistence.ManyToOne;
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
	// The label's real cost, from actually purchasing it - kept separate
	// from Orders.shippingCost (the rate quoted to the customer at
	// checkout), since the real package used to fulfil the order can end up
	// a different size than the checkout-time estimate, so this may not
	// match what the customer was quoted.
	private Long actualShippingCost;
	private String serviceType;
	private String easyPostId;
	private String trackingNumber;
	// Shippo's hosted tracking/label URLs are long signed URLs (query
	// params, tokens) that regularly blow past varchar(255).
	@Column(columnDefinition = "text")
	private String trackingUrl;
	@Column(columnDefinition = "text")
	private String labelPdfUrl;

	// The Shippo rate object id the customer's quote was actually locked in
	// at - needed to purchase the label at the same price/service level
	// after payment confirms, since that happens later (webhook-driven) and
	// can't just re-quote a fresh rate.
	private String shippoRateId;

	// Geocoded once (at creation, or via a one-time backfill) from addressTo
	// - see GoogleMapsService - so plotting the admin shipments map never
	// needs to re-geocode the same static address on every page load.
	private Double lat;
	private Double lng;

	// Many shipments can reuse the same parcel size instead of each
	// minting a new row - see ShippingParcelRepository for looking up an
	// existing match before creating one.
	@ManyToOne
	@JoinColumn(name = "shipping_parcel_id")
	private ShippingParcel parcel;

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

	// The package's last known checkpoint, from Shippo's track_updated
	// webhook (see ShippingService.applyTrackingUpdate) - only ever a
	// city/state/country from the carrier (no street-level precision), so
	// name/street1/street2/zip are left null. Null entirely until the first
	// tracking event arrives.
	@Embedded
	@AttributeOverrides({
			@AttributeOverride(name = "name", column = @Column(name = "current_name")),
			@AttributeOverride(name = "street1", column = @Column(name = "current_street1")),
			@AttributeOverride(name = "street2", column = @Column(name = "current_street2")),
			@AttributeOverride(name = "city", column = @Column(name = "current_city")),
			@AttributeOverride(name = "state", column = @Column(name = "current_state")),
			@AttributeOverride(name = "zip", column = @Column(name = "current_zip")),
			@AttributeOverride(name = "country", column = @Column(name = "current_country")),
	})
	private ShippingAddress currentLocation;

	// Geocoded from currentLocation the same way lat/lng is geocoded from
	// addressTo - see GoogleMapsService.
	private Double currentLat;
	private Double currentLng;

	@NotNull
	@NonNull
	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private Status status;

	public enum Status {
		PENDING, PURCHASED, IN_TRANSIT, DELIVERED
	}

}
