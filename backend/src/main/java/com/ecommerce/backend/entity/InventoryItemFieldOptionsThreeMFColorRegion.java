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
 * InventoryItemFieldOptionsThreeMFColorRegion is one color region of a 3MF file
 * offered in one color. Options sharing a uuid are the color choices for the
 * same region.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("three_mf_color_region")
public class InventoryItemFieldOptionsThreeMFColorRegion extends InventoryItemFieldOptions {

	/**
	 * Identifies the region inside the 3MF file.
	 */
	@NonNull
	@NotNull
	private UUID uuid;

	/**
	 * Human-readable region name, e.g. "Buckle".
	 */
	@NonNull
	@NotNull
	private String name;

	@NonNull
	@NotNull
	@ManyToOne
	@JoinColumn(name = "color_id")
	private Color selectedColor;
}
