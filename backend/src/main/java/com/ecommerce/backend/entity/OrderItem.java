package com.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Line item in a shopping cart linking a cart to an inventory item with
 * quantity.
 */
@Data
@Entity
@Table(name = "orderItem", uniqueConstraints = @UniqueConstraint(columnNames = { "orders_id", "item_id" }))
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // for JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class OrderItem {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotNull
	@NonNull
	@ManyToOne
	@JoinColumn(name = "orders_id", nullable = false)
	@JsonBackReference
	private Orders orders;

	@ManyToOne
	@JoinColumn(name = "item_id")
	private InventoryItem item;

	// TODO: consider @Positive (jakarta.validation)
	private Integer quantity;

	private String itemTitle;
	// TODO: consider @PositiveOrZero - a snapshot price, but shouldn't be negative
	private Long unitPrice;

}
