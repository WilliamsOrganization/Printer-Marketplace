package com.ecommerce.backend.dto;

import lombok.Data;

/**
 * ShipmentValues
 */
@Data
public class ShipmentFromValues {
	private String store="Print Market";
	private String street1="182 Harrison Drive NW";
	private String street2;
	private String city="Edmonton";
	private String zip="T5A 2X4";
	private String state="AB";
	private String country="CA";
}
