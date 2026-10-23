/* (C)2026 */
package com.ecommerce.backend.entity;

import java.time.LocalDateTime;
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

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.ToString;

/**
 * Line item in a shopping cart linking a cart to an inventory item with
 * quantity.
 */
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "cartItem", uniqueConstraints = @UniqueConstraint(columnNames = {"cart_id", "item_id",
		"configuration_key"}))
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // for JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class CartItem {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Long id;

	@CreationTimestamp
	private LocalDateTime createdAt;

	@UpdateTimestamp
	private LocalDateTime updatedAt;

	@NonNull
	@ManyToOne
	@JoinColumn(name = "cart_id", nullable = false)
	@JsonBackReference
	// This breaks the circular reference errors
	@ToString.Exclude
	private Cart cart;

	@NonNull
	@ManyToOne
	@JoinColumn(name = "item_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private InventoryItem item;

	@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "cart_item_id")
	@Builder.Default
	@ToString.Exclude
	private List<CartItemField> cartItemFields = new ArrayList<>();

	// TODO: consider @Positive (jakarta.validation) - can't add zero/negative
	// quantity to a cart
	@NonNull
	@Column(nullable = false)
	private Integer quantity;

	/**
	 * Canonical form of the selected options, e.g. "7:[5];8:[12, 13]". Identical
	 * configurations of the same item share a key, so they merge into one row.
	 */
	@NonNull
	@Column(name = "configuration_key", nullable = false, columnDefinition = "varchar(255) default ''")
	private String configurationKey;

	/**
	 * The selected options as one line, e.g. "Color: Red · Add-ons: Keyring". Empty
	 * for items without options.
	 */
	public String describeConfiguration() {
		List<String> parts = new ArrayList<>();
		for (CartItemField field : cartItemFields) {
			parts.add(field.describe());
		}
		return String.join(" · ", parts);
	}

	/**
	 * Price of one unit in dollars: the item's cost plus every selected option.
	 * Stripe, the order and the cart drawer all price from this.
	 */
	public long getUnitPrice() {
		long total = item.getItemCost();
		for (CartItemField field : cartItemFields) {
			total += field.tallyOptionsPrice();
		}
		return total;
	}
}
