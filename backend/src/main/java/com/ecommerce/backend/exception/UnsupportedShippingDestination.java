package com.ecommerce.backend.exception;

/**
 * UnsupportedShippingDestination is thrown when a shipment is
 * requested for a destination the shipping provider does not
 * support. Handled by GlobalExceptionHandler and mapped to an HTTP
 * 400 response.
 */
public class UnsupportedShippingDestination extends RuntimeException {
	/**
	 * UnsupportedShippingDestination constructor.
	 * @param message describes the unsupported destination
	 */
	public UnsupportedShippingDestination(String message){
		super(message);
	}
}
