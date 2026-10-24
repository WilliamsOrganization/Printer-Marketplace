/* (C)2026 */
package com.ecommerce.backend.entity;

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
 * An inventory item field contains a list of configurabel options that always
 * contain a price.
 *
 */
@Data
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@Table(name = "order_item_field")
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorColumn(name = "field_type")
public abstract class OrderItemField {

	/**
	 * Copies a cart field into the order as the matching order field type.
	 */
	public static OrderItemField from(CartItemField source) {
		return switch (source) {
			case CartItemFieldRadioGroup radioGroup -> OrderItemFieldRadioGroup.from(radioGroup);
			case CartItemFieldChecklist checklist -> OrderItemFieldChecklist.from(checklist);
			case CartItemFieldThreeMFColorPicker threeMFColorPicker ->
				OrderItemFieldThreeMFColorPicker.from(threeMFColorPicker);
			default ->
				throw new IllegalArgumentException("Unknown cart field type: " + source.getClass().getSimpleName());
		};
	}

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
	 * Returns the selected options for this field.
	 */
	@Transient
	public abstract List<? extends OrderItemFieldOptions> getOptions();

	/**
	 * The total price of the selected options in dollars.
	 */
	public long tallyOptionsPrice() {
		return getOptions().stream().mapToLong(OrderItemFieldOptions::getPrice).sum();
	}
}
