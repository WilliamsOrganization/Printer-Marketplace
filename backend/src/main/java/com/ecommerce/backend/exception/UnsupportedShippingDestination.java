package com.ecommerce.backend.exception;

/**
 * UnsupportedShippingDestination
 */
public class UnsupportedShippingDestination extends RuntimeException {
	public UnsupportedShippingDestination(String message){
		super(message);
	}
}
