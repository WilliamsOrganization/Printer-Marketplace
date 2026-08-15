package com.ecommerce.backend.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
 * Shopping cart belonging to a user, containing cart items.
 */
@Data
@Entity
@Table(name = "orders")
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // for JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Orders {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@CreationTimestamp
	private LocalDateTime date;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	@NotNull
	@NonNull
	private Users user;

	
	// TODO: consider @OrderBy("id ASC") (or createdAt, if OrderItem gets one) to
	// guarantee items are fetched in creation order rather than undefined order
	// TODO: consider @Singular if this collection moves under a @Builder
	@OneToMany(mappedBy = "orders", cascade = CascadeType.ALL)
	@JsonManagedReference
	private List<OrderItem> items;

	@OneToOne(mappedBy = "orders")
	@JsonManagedReference
	private Shipping shipping;

	private String stripeEmail;

	private String stripeSessionId;
	// TODO: consider @Email (jakarta.validation)
	private String email;
	// TODO: consider @PositiveOrZero
	private Long subtotal;
	// TODO: consider @PositiveOrZero
	private Long shippingCost;
	// TODO: consider @PositiveOrZero
	private Long total;
	private String currency;

	@NotNull
	@NonNull
	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private Status status;

	/**
	 * Order status.
	 */
	public enum Status {
		COMPLETED, EXPIRED, FAILED, PENDING
	}
}
