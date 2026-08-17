package com.ecommerce.backend.exception;

/**
 * OrderNotFoundException
 */
public class OrderNotFoundException extends RuntimeException {
	public OrderNotFoundException(String message){
		super(message);
	}
}
