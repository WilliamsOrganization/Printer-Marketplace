package com.ecommerce.backend.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

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
public class Shipping {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@CreationTimestamp
	private LocalDateTime createdAt;

	@OneToOne
	@JoinColumn(name = "orders_id", nullable = false)
	@NotNull
	private Orders orders;

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
	private String postalCode;
	private String country;

	@NotNull
	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private Status status;

	public enum Status {
		PENDING, PURCHASED, IN_TRANSIT, DELIVERED
	}

}
