package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AuthResponse;
import com.ecommerce.backend.dto.LoginRequest;
import com.ecommerce.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;


/**
 * AuthController
 */
@RestController
@RequestMapping("/server/auth/")
@RequiredArgsConstructor
public class AuthController {
	private final AuthService authService;

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> Login(@RequestBody LoginRequest request) {
		if (request.getPassword() == null) {
			return ResponseEntity.ok(authService.handleLogin(request));
		}
		return ResponseEntity.ok(authService.handlePasswordLogin(request));
	}

	@GetMapping("/verify-admin")
	@PreAuthorize("hasRole('ADMIN')")
		public ResponseEntity<Void> verifyAdmin() {
			return ResponseEntity.ok().build();
		}
		
}
