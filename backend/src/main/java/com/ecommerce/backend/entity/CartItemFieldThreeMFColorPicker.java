/* (C)2026 */
package com.ecommerce.backend.entity;

import java.net.URL;
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

	@NonNull
	@NotNull
	private URL threeMFUrl;

	@ManyToMany(cascade = CascadeType.ALL)
	@JoinTable(name = "cart_three_mf_color_picker_options", joinColumns = @JoinColumn(name = "color_picker_id"), inverseJoinColumns = @JoinColumn(name = "options_id"))
	@NonNull
	@NotNull
	private List<CartItemFieldOptionsThreeMFColorRegion> options;

	/**
	 * Returns the selected region colors for this field.
	 */
	public List<CartItemFieldOptionsThreeMFColorRegion> getOptions() {
		return options;
	}
}
