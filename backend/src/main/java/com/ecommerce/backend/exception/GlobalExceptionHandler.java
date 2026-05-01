package com.ecommerce.backend.exception;


import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<String> handleUserNotFound(UserNotFoundException ex) {
		log.warn("UserNotFoundException: {}", ex.getMessage());
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
	}
	@ExceptionHandler(InvalidCredentials.class)
	public ResponseEntity<String> handleInvalidCredentials(InvalidCredentials ex) {
		log.warn("InvalidCredentials: {}", ex.getMessage());
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
	}
}
