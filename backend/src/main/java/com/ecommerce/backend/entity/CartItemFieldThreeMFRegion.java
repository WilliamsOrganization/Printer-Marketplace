/* (C)2026 */
package com.ecommerce.backend.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

/**
 * CartItemFieldThreeMFRegion is one region of a 3MF file in a customer's cart
 * and the single color they picked for it.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@Table(name = "cart_item_field_three_mf_region", uniqueConstraints = @UniqueConstraint(columnNames = {
		"cart_item_field_id", "slot_index"}))
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // for JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class CartItemFieldThreeMFRegion {

	/**
	 * Copies an inventory region and the color chosen for it into the cart.
	 */
	public static CartItemFieldThreeMFRegion from(InventoryItemFieldThreeMFRegion region,
			InventoryItemFieldOptionsThreeMFColorRegion option) {
		return builder().slotIndex(region.getSlotIndex()).name(region.getName())
				.option(CartItemFieldOptionsThreeMFColorRegion.from(region, option)).build();
	}

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "cart_item_field_id", nullable = false)
	@JsonIgnore
	private CartItemFieldThreeMFColorPicker field;

	/**
	 * The 3MF pindex this region covers.
	 */
	@NonNull
	@NotNull
	@Column(name = "slot_index", nullable = false)
	private Integer slotIndex;

	@NonNull
	@NotNull
	@Column(nullable = false)
	private String name;

	@OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "option_id", nullable = false, unique = true)
	@NonNull
	@NotNull
	private CartItemFieldOptionsThreeMFColorRegion option;
}
