/* (C)2026 */
package com.ecommerce.backend.entity;

import java.net.URL;
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
 * OrderItemFieldThreeMFColorPicker is the 3MF file and per-region colors to
 * print for an ordered item.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("three_mf_color_picker")
public class OrderItemFieldThreeMFColorPicker extends OrderItemField {

	/**
	 * Copies a cart 3MF color picker and its selected region colors into the
	 * order.
	 */
	public static OrderItemFieldThreeMFColorPicker from(CartItemFieldThreeMFColorPicker source) {
		List<OrderItemFieldOptionsThreeMFColorRegion> options = new ArrayList<>();
		for (CartItemFieldOptionsThreeMFColorRegion option : source.getOptions()) {
			options.add(OrderItemFieldOptionsThreeMFColorRegion.from(option));
		}
		return builder().label(source.getLabel()).description(source.getDescription())
				.threeMFUrl(source.getThreeMFUrl()).options(options).build();
	}

	@NonNull
	@NotNull
	private URL threeMFUrl;

	@ManyToMany(cascade = CascadeType.ALL)
	@JoinTable(name = "order_three_mf_color_picker_options", joinColumns = @JoinColumn(name = "color_picker_id"), inverseJoinColumns = @JoinColumn(name = "options_id"))
	@NonNull
	@NotNull
	private List<OrderItemFieldOptionsThreeMFColorRegion> options;

	/**
	 * Returns the region colors for this field.
	 */
	public List<OrderItemFieldOptionsThreeMFColorRegion> getOptions() {
		return options;
	}
}
