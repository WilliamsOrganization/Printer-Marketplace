package com.ecommerce.backend.exception;

/**
 * ExistingShippingFound is thrown when an operation expects no
 * existing shipping record (e.g. creation) but one already exists.
 * Handled by GlobalExceptionHandler and mapped to an HTTP 409
 * response.
 */
public class ExistingShippingFound extends RuntimeException {
	/**
	 * ExistingShippingFound constructor.
	 * @param message
	 */
	public ExistingShippingFound(String message){
		super(message);
	}
}
