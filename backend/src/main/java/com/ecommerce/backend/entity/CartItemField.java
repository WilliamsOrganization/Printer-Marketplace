/* (C)2026 */
package com.ecommerce.backend.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.NotNull;

import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.experimental.SuperBuilder;

/**
 * A cart item field holds the options a customer has selected for one
 * configurable field of an item sitting in their cart.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Data
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@Table(name = "cart_item_field")
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorColumn(name = "field_type")
public abstract class CartItemField {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE)
	private Long id;

	@NonNull
	@NotNull
	@Column(nullable = false)
	private String label;

	@NonNull
	@NotNull
	@Column(nullable = false)
	private String description;

	/**
	 * Human-readable form of this selection, e.g. "Color: Red" or "Add-ons:
	 * Keyring, Gift box".
	 */
	public String describe() {
		List<String> optionLabels = new ArrayList<>();
		for (CartItemFieldOptions option : getOptions()) {
			optionLabels.add(option.getLabel());
		}
		return label + ": " + String.join(", ", optionLabels);
	}

	/**
	 * Returns the selected options for this field.
	 */
	@Transient
	public abstract List<? extends CartItemFieldOptions> getOptions();

	/**
	 * The total price of the selected options in dollars.
	 */
	public long tallyOptionsPrice() {
		return getOptions().stream().mapToLong(CartItemFieldOptions::getPrice).sum();
	}
}
