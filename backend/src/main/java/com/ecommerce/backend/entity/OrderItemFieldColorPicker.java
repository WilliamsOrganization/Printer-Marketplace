/* (C)2026 */
package com.ecommerce.backend.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.validation.constraints.NotNull;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * OrderItemFieldOptionsDropdown is a collection of options for a group of
 * OrderItemFields, such as a size or weight category.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("color_picker")
public class OrderItemFieldColorPicker extends OrderItemField {

	/**
	 * Copies a cart color picker and its selected color into the order.
	 */
	public static OrderItemFieldColorPicker from(CartItemFieldColorPicker source) {
		List<OrderItemFieldOptionsStlColor> options = new ArrayList<>();
		for (CartItemFieldOptionsStlColor option : source.getOptions()) {
			options.add(OrderItemFieldOptionsStlColor.from(option));
		}
		return builder().label(source.getLabel()).description(source.getDescription()).options(options).build();
	}

	@ManyToMany(cascade = CascadeType.ALL)
	@JoinTable(name = "order_color_picker_options", joinColumns = @JoinColumn(name = "color_picker_id"), inverseJoinColumns = @JoinColumn(name = "options_id"))
	@NonNull
	@NotNull
	private List<OrderItemFieldOptionsStlColor> options;;

	/**
	 * Returns the options for this field.
	 */
	public List<OrderItemFieldOptionsStlColor> getOptions() {
		return options;
	}
}
