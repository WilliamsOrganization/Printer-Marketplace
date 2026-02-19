package com.ecommerce.backend.exception;

/**
 * UserNotFoundException
 */
public class UserNotFoundException extends RuntimeException {
	public UserNotFoundException(String message){
		super(message);
	}
}
