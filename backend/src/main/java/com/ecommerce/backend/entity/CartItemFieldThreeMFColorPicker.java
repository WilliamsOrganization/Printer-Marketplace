/* (C)2026 */
package com.ecommerce.backend.entity;

import java.net.URL;
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
 * CartItemFieldThreeMFColorPicker holds the region colors a customer selected
 * for a 3MF file on an item in their cart.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("three_mf_color_picker")
public class CartItemFieldThreeMFColorPicker extends CartItemField {

	/**
	 * Builds the picker and points each region back at it.
	 */
	public static CartItemFieldThreeMFColorPicker from(InventoryItemFieldThreeMFColorPicker source,
			List<CartItemFieldThreeMFRegion> regions) {
		CartItemFieldThreeMFColorPicker picker = builder().label(source.getLabel())
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
	private List<CartItemFieldThreeMFRegion> regions;

	/**
	 * Returns the selected color of every region.
	 */
	public List<CartItemFieldOptionsThreeMFColorRegion> getOptions() {
		return regions.stream().map(CartItemFieldThreeMFRegion::getOption).toList();
	}
}
