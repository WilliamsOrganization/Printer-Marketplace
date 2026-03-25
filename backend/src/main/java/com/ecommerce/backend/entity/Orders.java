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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Shopping cart belonging to a user, containing cart items.
 */
@Data
@Entity
@Table(name = "orders")
public class Orders {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@CreationTimestamp
	private LocalDateTime date;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	@NotNull
	private Users user;
	
	@OneToMany(mappedBy = "orders", cascade = CascadeType.ALL)
	private List<OrderItem> items;

	@OneToOne(mappedBy = "orders")
	private Shipping shipping;

	private String stripeSessionId;
	private String email;
	private Long subtotal;
	private Long shippingCost;
	private Long total;
	private String currency;

	@NotNull
	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private Status status;

	public enum Status {
		PENDING, PAID, SHIPPED, DELIVERED, CANCELLED
	}


}
