package com.ecommerce.backend.exception;

/**
 * UserNotFoundException
 */
public class ExistingUserFoundException extends RuntimeException {
	public ExistingUserFoundException(String message){
		super(message);
	}
}
