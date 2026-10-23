/* (C)2026 */
package com.ecommerce.backend.entity;

import java.net.URL;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * CartItemFieldOptionsStlColor is a color selected for an STL file on a color
 * picker CartItemField.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("stl_color")
public class CartItemFieldOptionsStlColor extends CartItemFieldOptions {
	/**
	 * Given an InventoryItemFieldOptionsStlColor, returns a
	 * CartItemFieldOptionsStlColor.
	 * 
	 * @param options
	 * @param stlUrl
	 * @return
	 */
	public static CartItemFieldOptionsStlColor from(InventoryItemFieldOptionsStlColor options, URL stlUrl) {
		return CartItemFieldOptionsStlColor.builder().label(options.getLabel()).price(options.getPrice())
				.selectedColor(options.getSelectedColor()).stlUrl(stlUrl).build();
	}

	@NonNull
	@NotNull
	private InventoryItemFieldOptionsStlColor.Color selectedColor;

	@NonNull
	@NotNull
	private URL stlUrl;
}
