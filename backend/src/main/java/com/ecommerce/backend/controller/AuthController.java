package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AuthResponse;
import com.ecommerce.backend.dto.LoginRequest;
import com.ecommerce.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * AuthController
 */
@RestController
@RequestMapping("/api/auth/")
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
}
