/* (C)2026 */
package com.ecommerce.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.experimental.SuperBuilder;

/**
 * CartItemFieldOptions is a single option a customer selected for a
 * CartItemField, such as a size or weight category.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Data
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@Table(name = "cart_item_field_options")
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorColumn(name = "option_type")
public abstract class CartItemFieldOptions {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE)
	private Long id;

	@NonNull
	@NotNull
	@Column(nullable = false)
	private String label;

	/**
	 * The price of the option in dollars, the same unit as InventoryItem.itemCost.
	 */
	@NonNull
	@NotNull
	@Column(nullable = false)
	private Long price;
}
