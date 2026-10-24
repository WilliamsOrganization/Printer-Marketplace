/* (C)2026 */
package com.ecommerce.backend.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

/**
 * InventoryItemFieldThreeMFRegion is one color slot of a 3MF file, the pindex
 * every object in that slot shares. Its options are the colors the region is
 * offered in.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@Table(name = "inventory_item_field_three_mf_region", uniqueConstraints = @UniqueConstraint(columnNames = {
		"inventory_item_field_id", "slot_index"}))
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // for JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class InventoryItemFieldThreeMFRegion {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "inventory_item_field_id", nullable = false)
	@JsonBackReference("three-mf-regions")
	private InventoryItemFieldThreeMFColorPicker field;

	/**
	 * The 3MF pindex this region covers.
	 */
	@NonNull
	@NotNull
	@Column(name = "slot_index", nullable = false)
	private Integer slotIndex;

	/**
	 * Human-readable region name, e.g. "Buckle".
	 */
	@NonNull
	@NotNull
	@Column(nullable = false)
	private String name;

	@OneToMany(mappedBy = "region", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference("three-mf-region-options")
	@NonNull
	@NotNull
	private List<InventoryItemFieldOptionsThreeMFColorRegion> options;
}
