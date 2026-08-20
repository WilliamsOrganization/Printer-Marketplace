package com.ecommerce.backend.entity;

import jakarta.persistence.Embeddable;

import com.goshippo.shippo_sdk.models.components.Address;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ShippingAddress mirrors the fields of Shippo's Address model so it can be
 * persisted directly. Embedded twice on Shipping, once for the origin
 * ("from") and once for the destination ("to").
 */
@Data
@Embeddable
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddress {
	private String name;
	private String street1;
	private String street2;
	private String city;
	private String state;
	private String zip;
	private String country;

	/**
	 * Maps a Shippo Address (fields mostly Optional<String>) onto this
	 * embeddable's plain-String shape.
	 *
	 * @param address the Shippo address to copy
	 * @return the mapped ShippingAddress
	 */
	public static ShippingAddress from(Address address) {
		return ShippingAddress.builder()
				.name(address.name().orElse(null))
				.street1(address.street1().orElse(null))
				.street2(address.street2().orElse(null))
				.city(address.city().orElse(null))
				.state(address.state().orElse(null))
				.zip(address.zip().orElse(null))
				.country(address.country())
				.build();
	}
}
