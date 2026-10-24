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
 * OrderItemFieldOptionsThreeMFColorRegion is the color to print one region of a
 * 3MF file in.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("three_mf_color_region")
public class OrderItemFieldOptionsThreeMFColorRegion extends OrderItemFieldOptions {

	/**
	 * Copies a cart region color into the order.
	 */
	public static OrderItemFieldOptionsThreeMFColorRegion from(CartItemFieldOptionsThreeMFColorRegion source) {
		return builder().label(source.getLabel()).price(source.getPrice()).selectedColor(source.getSelectedColor())
				.build();
	}

	@NonNull
	@NotNull
	@ManyToOne
	@JoinColumn(name = "color_id")
	private Color selectedColor;
}
