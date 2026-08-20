package com.ecommerce.backend.exception;

/**
 * ForbiddenException is thrown when an authenticated user attempts an
 * action they do not have permission to perform. Handled by
 * GlobalExceptionHandler and mapped to an HTTP 403 response.
 */
public class ForbiddenException extends RuntimeException {
	/**
	 * ForbiddenException constructor.
	 * @param message describes why the action was forbidden
	 */
	public ForbiddenException(String message){
		super(message);
	}
}
