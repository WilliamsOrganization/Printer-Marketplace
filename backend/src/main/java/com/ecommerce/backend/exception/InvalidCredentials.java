package com.ecommerce.backend.exception;

/**
 * UserNotFoundException
 */
public class InvalidCredentials extends RuntimeException {
	public InvalidCredentials(String message){
		super(message);
	}
}
