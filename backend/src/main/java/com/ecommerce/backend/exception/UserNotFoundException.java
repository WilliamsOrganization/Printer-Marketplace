package com.ecommerce.backend.exception;

/**
 * UserNotFoundException is thrown when a requested user cannot be
 * located. Handled by GlobalExceptionHandler and mapped to an HTTP
 * 404 response.
 */
public class UserNotFoundException extends RuntimeException {
	/**
	 * UserNotFoundException constructor.
	 * @param message describes the user that could not be found
	 */
	public UserNotFoundException(String message){
		super(message);
	}
}
