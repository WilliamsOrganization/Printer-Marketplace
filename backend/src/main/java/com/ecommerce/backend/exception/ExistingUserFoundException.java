package com.ecommerce.backend.exception;

/**
 * ExistingUserFoundException is thrown when an operation expects no
 * existing user (e.g. registration) but one already exists for the
 * given identifier. Handled by GlobalExceptionHandler and mapped to
 * an HTTP 409 response.
 */
public class ExistingUserFoundException extends RuntimeException {
	/**
	 * ExistingUserFoundException constructor.
	 * @param message describes the conflicting existing user
	 */
	public ExistingUserFoundException(String message){
		super(message);
	}
}
