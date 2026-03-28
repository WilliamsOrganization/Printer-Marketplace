package com.ecommerce.backend.dto;

import lombok.Data;

@Data
public class ShipmentFromValues {
	private String store = "PrintMarket";
	private String street1 = "182 Harrison Dr NW";
	private String street2;
	private String city = "Edmonton";
	private String zip = "T5A2X4";
	private String state = "AB";
	private String country = "CA";
	private String phone = "7802887365";
}
