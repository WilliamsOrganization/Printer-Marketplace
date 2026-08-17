package com.ecommerce.backend.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
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
 * Returns containing refind metadata and a reference to the order and items to return. and the shipping status in reverse (destination and back)
 */
@Data
@Entity
@Table(name = "returns")
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // for JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Returns {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@NonNull
	@NotNull
	@CreationTimestamp
	private LocalDateTime requestedDate;

	@NonNull
	@NotNull
	@OneToOne
	@JoinColumn(name = "orders_id", unique = true)
	@JsonBackReference("order-returns")
	private Orders order;

	@NonNull
	@NotNull
	@OneToMany
	@JoinColumn(name = "returns_id")
	private List<OrderItem> itemsToReturn;

	@OneToOne
	@JoinColumn(name = "shipping_id")
	@JsonBackReference("shipping-returns")
	private Shipping shipping;

	@NonNull
	@NotNull
	private String reasonForReturn;

	@NonNull
	@NotNull
	@Enumerated(EnumType.STRING)
	private ReturnStatus status;

	private String shippingEstimate;

	private String stripeRefundId;

	private Long refundedAmount;

	private LocalDateTime refundedAt;

	@NonNull
	@NotNull
	@Builder.Default
	private Boolean reviewed = false;
	/**
	 *
	 */
	public enum ReturnStatus {
		PENDING, CANCELLED, REFUNDED
	}
}
