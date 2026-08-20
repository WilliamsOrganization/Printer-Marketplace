package com.ecommerce.backend.exception;

/**
 * InvalidCredentials is thrown when a login or authentication attempt
 * fails due to incorrect credentials. Handled by
 * GlobalExceptionHandler and mapped to an HTTP 401 response.
 */
public class InvalidCredentials extends RuntimeException {
	/**
	 * InvalidCredentials constructor.
	 * @param message describes why the credentials were invalid
	 */
	public InvalidCredentials(String message){
		super(message);
	}
}
