/* (C)2026 */
package com.ecommerce.backend.entity;

import java.util.UUID;

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
	 * CartItemFieldOptionsThreeMFColorRegion.
	 */
	public static CartItemFieldOptionsThreeMFColorRegion from(InventoryItemFieldOptionsThreeMFColorRegion option) {
		return builder().label(option.getLabel()).price(option.getPrice()).uuid(option.getUuid())
				.name(option.getName()).selectedColor(option.getSelectedColor()).build();
	}

	@NonNull
	@NotNull
	private UUID uuid;

	@NonNull
	@NotNull
	private String name;

	@NonNull
	@NotNull
	@ManyToOne
	@JoinColumn(name = "color_id")
	private Color selectedColor;
}
