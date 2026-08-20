package com.ecommerce.backend.dto;

import jakarta.annotation.Nonnull;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;


/**
 * ShipmentToRequest
 */
@Data
@Builder
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class ShipmentToRequest {
	private String name;
	@Nonnull
	private String street1;

	private String street2;
	@Nonnull
	private String city;
	@Nonnull
	private String zip;
	@Nonnull
	private String state;
	@Nonnull
	private String country;
	@Nonnull
	private String phone;
	@Nonnull
	private String email;
}
