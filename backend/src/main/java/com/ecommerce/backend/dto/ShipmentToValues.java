package com.ecommerce.backend.dto;

import lombok.Data;

@Data
public class ShipmentToValues {
	private String name;
	private String street1;
	private String street2;
	private String city;
	private String zip;
	private String state;
	private String country;
	private String phone;
}
