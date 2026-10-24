/* (C)2026 */
package com.ecommerce.backend.entity;

import java.net.URL;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * InventoryItemFieldThreeMFColorPicker is a single 3MF file split into color
 * regions. Each option is one region offered in one color; the customer picks
 * exactly one option per region.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("three_mf_color_picker")
public class InventoryItemFieldThreeMFColorPicker extends InventoryItemField {

	@NonNull
	@NotNull
	private URL threeMFUrl;

	@OneToMany(mappedBy = "inventoryItemField", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
	@NonNull
	@NotNull
	private List<InventoryItemFieldOptionsThreeMFColorRegion> options;

	/**
	 * Returns the region/color options for this field.
	 */
	public List<InventoryItemFieldOptionsThreeMFColorRegion> getOptions() {
		return options;
	}
}
