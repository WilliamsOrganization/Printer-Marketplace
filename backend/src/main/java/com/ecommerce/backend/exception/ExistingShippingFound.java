package com.ecommerce.backend.exception;

/**
 * ExistingShippingFound
 */
public class ExistingShippingFound extends RuntimeException {
	public ExistingShippingFound(String message){
		super(message);
	}
}
