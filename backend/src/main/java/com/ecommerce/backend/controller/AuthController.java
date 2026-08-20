package com.ecommerce.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.dto.AccountCreationRequest;
import com.ecommerce.backend.dto.AuthResponse;
import com.ecommerce.backend.dto.EmailVerificationRequest;
import com.ecommerce.backend.dto.LoginRequestWithProvider;
import com.ecommerce.backend.dto.ResetPasswordConfirmRequest;
import com.ecommerce.backend.dto.ResetPasswordRequest;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.exception.UserNotFoundException;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.service.AuthService;
import com.ecommerce.backend.service.UserService;
import com.resend.core.exception.ResendException;

import lombok.RequiredArgsConstructor;

/**
 * AuthController
 */
@RestController
@RequestMapping("/server/auth/")
@RequiredArgsConstructor
public class AuthController {
	private final AuthService authService;
	private final UserService userService;
	private final UserRepository userRepository;

	/**
	 * Handles logins and password logins
	 */
	@PostMapping("/login")
	public ResponseEntity<AuthResponse> Login(@RequestBody LoginRequestWithProvider request) {
		if (request.getPassword() == null) {
			return ResponseEntity.ok(authService.handleLogin(request));
		}
		return ResponseEntity.ok(authService.handlePasswordLogin(request));
	}

	/**
	 * Verifies that the user is an admin
	 */
	@GetMapping("/verify-admin")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> verifyAdmin() {
		return ResponseEntity.ok().build();
	}

	/**
	 * Creates a new account with a password
	 *
	 * @param AccountCreationRequest
	 */
	@PostMapping("/create")
	public AuthResponse Create(@RequestBody AccountCreationRequest request)
			throws ResendException {
		return authService.handleAccountCreation(request);
	}

	/**
	 * Email verification route for password logins
	 *
	 */
	@PostMapping("/verify-email")
	public AuthResponse verify(@RequestBody EmailVerificationRequest request) {
		Users user = userService.getUserFromSession();
		return authService.handleEmailVerification(user, request);
	}

	/**
	 * Email verification route for password logins
	 *
	 */
	@PostMapping("/reset-password")
	public void verify(@RequestBody ResetPasswordRequest request) throws ResendException {
		Users user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new UserNotFoundException("User does not exist"));
		authService.sendResetPasswordEmail(user, request);
	}

	/**
	 * Confirms a password reset using the code from the reset email and
	 * sets the new password.
	 */
	@PostMapping("/reset-password/confirm")
	public AuthResponse confirmReset(@RequestBody ResetPasswordConfirmRequest request) {
		return authService.confirmResetPassword(request);
	}

	/**
	 * Checks whether a reset-password link is still valid, without
	 * consuming the code, so the frontend can reject an expired link
	 * before showing the new-password fields.
	 */
	@GetMapping("/reset-password/validate")
	public ResponseEntity<Void> validateReset(@RequestParam String email, @RequestParam String code) {
		authService.validateResetCode(email, code);
		return ResponseEntity.ok().build();
	}
}
