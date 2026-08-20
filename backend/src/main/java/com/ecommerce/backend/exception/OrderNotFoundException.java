package com.ecommerce.backend.exception;

/**
 * OrderNotFoundException is thrown when a requested order cannot be
 * located. Handled by GlobalExceptionHandler and mapped to an HTTP
 * 404 response.
 */
public class OrderNotFoundException extends RuntimeException {
	/**
	 * OrderNotFoundException constructor.
	 * @param message describes the order that could not be found
	 */
	public OrderNotFoundException(String message){
		super(message);
	}
}
