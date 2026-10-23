/* (C)2026 */
package com.ecommerce.backend.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonBackReference;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * Line item in a shopping cart linking a cart to an inventory item with
 * quantity.
 */
@Data
@Entity
@Table(name = "orderItem", uniqueConstraints = @UniqueConstraint(columnNames = {"orders_id", "item_id",
		"configuration_key"}))
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

	/**
	 * Copied from the cart item this line came from, e.g. "7:[5];8:[12, 13]".
	 */
	@Column(name = "configuration_key", nullable = false, columnDefinition = "varchar(255) default ''")
	@Builder.Default
	private String configurationKey = "";

	/**
	 * The options the customer chose for this line, copied from their cart at
	 * checkout.
	 */
	@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "order_item_id")
	@Builder.Default
	private List<OrderItemField> orderItemFields = new ArrayList<>();
}
