package com.ecommerce.backend.exception;

/**
 * NotFoundException is a generic exception thrown when a requested
 * resource could not be located. Handled by GlobalExceptionHandler
 * and mapped to an HTTP 404 response.
 */
public class NotFoundException extends RuntimeException {
	/**
	 * NotFoundException constructor.
	 * @param message describes the resource that could not be found
	 */
	public NotFoundException(String message) {
		super(message);
	}
}
