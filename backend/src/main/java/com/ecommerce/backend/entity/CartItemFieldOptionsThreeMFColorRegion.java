/* (C)2026 */
package com.ecommerce.backend.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * CartItemFieldOptionsThreeMFColorRegion is the color a customer selected for
 * one region of a 3MF file.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("three_mf_color_region")
public class CartItemFieldOptionsThreeMFColorRegion extends CartItemFieldOptions {

	/**
	 * Given an InventoryItemFieldOptionsThreeMFColorRegion, returns a
	 * CartItemFieldOptionsThreeMFColorRegion. The label is prefixed with the
	 * region name so describe() reads "Buckle: Red" instead of just "Red".
	 */
	public static CartItemFieldOptionsThreeMFColorRegion from(InventoryItemFieldThreeMFRegion region,
			InventoryItemFieldOptionsThreeMFColorRegion option) {
		return builder().label(region.getName() + ": " + option.getLabel()).price(option.getPrice())
				.selectedColor(option.getSelectedColor()).build();
	}

	@NonNull
	@NotNull
	@ManyToOne
	@JoinColumn(name = "color_id")
	private Color selectedColor;
}
