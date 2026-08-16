package com.ecommerce.backend.exception;

/**
 * ForbiddenException
 */
public class ForbiddenException extends RuntimeException {
	public ForbiddenException(String message){
		super(message);
	}
}
