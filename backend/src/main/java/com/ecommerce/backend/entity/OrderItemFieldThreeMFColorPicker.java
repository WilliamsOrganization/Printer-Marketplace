/* (C)2026 */
package com.ecommerce.backend.entity;

import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
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
	 * Copies a cart 3MF color picker and its region colors into the order.
	 */
	public static OrderItemFieldThreeMFColorPicker from(CartItemFieldThreeMFColorPicker source) {
		List<OrderItemFieldThreeMFRegion> regions = new ArrayList<>();
		for (CartItemFieldThreeMFRegion region : source.getRegions()) {
			regions.add(OrderItemFieldThreeMFRegion.from(region));
		}
		OrderItemFieldThreeMFColorPicker picker = builder().label(source.getLabel())
				.description(source.getDescription()).threeMFUrl(source.getThreeMFUrl()).regions(regions).build();
		regions.forEach(region -> region.setField(picker));
		return picker;
	}

	@NonNull
	@NotNull
	private URL threeMFUrl;

	@OneToMany(mappedBy = "field", cascade = CascadeType.ALL, orphanRemoval = true)
	@NonNull
	@NotNull
	private List<OrderItemFieldThreeMFRegion> regions;

	/**
	 * Returns the color of every region.
	 */
	public List<OrderItemFieldOptionsThreeMFColorRegion> getOptions() {
		return regions.stream().map(OrderItemFieldThreeMFRegion::getOption).toList();
	}
}
