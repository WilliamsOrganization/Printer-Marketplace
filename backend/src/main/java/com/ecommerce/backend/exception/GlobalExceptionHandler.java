package com.ecommerce.backend.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import lombok.extern.slf4j.Slf4j;

/**
 * GlobalExceptionHandler handles all uncaught exceptions
 */
@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

	/**
	 * handleUserNotFound handles the UserNotFoundException
	 * 
	 * @param ex
	 * @return
	 */
	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<String> handleUserNotFound(UserNotFoundException ex) {
		log.warn("UserNotFoundException: {}", ex.getMessage());
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
	}
	
	/**
	 * handleExistingUserFound handles the ExistingUserFoundException
	 *
	 * @param ex
	 * @return
	 */
	@ExceptionHandler(ExistingUserFoundException.class)
	public ResponseEntity<String> handleExistingUserFound(ExistingUserFoundException ex) {
		log.warn("ExistingUserFoundException: {}", ex.getMessage());
		return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
	}

	/**
	 * handleInvalidCredentials handles the InvalidCredentials
	 * 
	 * @param ex
	 * @return
	 */
	@ExceptionHandler(InvalidCredentials.class)
	public ResponseEntity<String> handleInvalidCredentials(InvalidCredentials ex) {
		log.warn("InvalidCredentials: {}", ex.getMessage());
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
	}

	/**
	 * handleForbidden handles the ForbiddenException
	 *
	 * @param ex
	 * @return
	 */
	@ExceptionHandler(ForbiddenException.class)
	public ResponseEntity<String> handleForbidden(ForbiddenException ex) {
		log.warn("ForbiddenException: {}", ex.getMessage());
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
	}

	/**
	 * handleUnexpected handles any other exceptions
	 * 
	 * @param ex
	 * @return
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<String> handleUnexpected(Exception ex) {
		log.error("[ERROR] Unhandled exception", ex);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
	}
}
