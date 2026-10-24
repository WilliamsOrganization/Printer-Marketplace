/* (C)2026 */
package com.ecommerce.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonBackReference;

import lombok.AccessLevel;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

/**
 * InventoryItemFieldOptions is a collection of options for a group of
 * InventoryItemFields, such as a size or weight category.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Data
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
// A 3MF region can't offer the same color twice
@Table(name = "inventory_item_field_options", uniqueConstraints = @UniqueConstraint(columnNames = {
		"three_mf_region_id", "color_id"}))
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorColumn(name = "option_type")
public abstract class InventoryItemFieldOptions {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE)
	private Long id;

	@NonNull
	@NotNull
	@Column(nullable = false)
	private String label;

	@NonNull
	@NotNull
	@Column(nullable = false)
	private Long price;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "inventory_item_field_id")
	@JsonBackReference
	@ToString.Exclude
	@EqualsAndHashCode.Exclude
	private InventoryItemField inventoryItemField;
}
