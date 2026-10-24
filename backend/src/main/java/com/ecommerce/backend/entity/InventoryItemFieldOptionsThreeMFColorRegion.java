/* (C)2026 */
package com.ecommerce.backend.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonBackReference;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * InventoryItemFieldOptionsThreeMFColorRegion is one color a 3MF region is
 * offered in. The customer picks exactly one option per region.
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

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "three_mf_region_id")
	@JsonBackReference("three-mf-region-options")
	private InventoryItemFieldThreeMFRegion region;

	@NonNull
	@NotNull
	@ManyToOne
	@JoinColumn(name = "color_id")
	private Color selectedColor;
}
