package com.ecommerce.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.AccountCreationRequest;
import com.ecommerce.backend.dto.AuthResponse;
import com.ecommerce.backend.dto.LoginRequestWithProvider;
import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.exception.ExistingUserFoundException;
import com.ecommerce.backend.exception.InvalidCredentials;
import com.ecommerce.backend.exception.UserNotFoundException;
import com.ecommerce.backend.repository.SessionRepository;
import com.ecommerce.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * AuthService handles all of the business logic for logging in
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
	private static final long DAYS = 30;
	private final UserRepository userRepository;
	private final UserService userService;
	private final SessionRepository sessionRepository;
	private final PasswordEncoder passwordEncoder;
	private final SessionService sessionService;


	/**
	 * Create a new session for a user if one doesn't already exist.
	 * 
	 * @return the new session
	 */
	public Sessions resolveSession(String token) throws UserNotFoundException {
		Sessions session = sessionRepository.findbyTokenWithUser(token).orElse(null);
		if (session == null) {
			throw new UserNotFoundException("User not found");
		}
		return session;
	}

	/**
	 * Builds the Spring Security Authentication for a resolved session. If
	 * the session has no user attached yet, the resulting Authentication
	 * carries no authorities (equivalent to anonymous) until one is.
	 *
	 * @param session the current session
	 * @return the Authentication to set on the SecurityContext
	 */
	public Authentication buildAuthentication(Sessions session) {
		List<SimpleGrantedAuthority> authorities = new ArrayList<>();
		Users user = session.getUser();
		if (user != null) {
			authorities.add(
					new SimpleGrantedAuthority("ROLE_" + user.getUserRole().name()));
			if (Boolean.TRUE.equals(user.getIsAdmin())) {
				authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
			}
		}
		return new UsernamePasswordAuthenticationToken(session, null, authorities);
	}

	/**
	 * handleLogin handles the login request and returns the session token
	 * 
	 * @param request
	 * @return 
	 */
	public AuthResponse handleLogin(LoginRequestWithProvider request) {
		Users user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(
						() -> new UserNotFoundException("User does not exist"));
		Sessions session = sessionService.sessionCreateWithProvider(user, request);
		return new AuthResponse(session.getToken(), user.getId(), user.getEmail(), user.getPhoneNumber());
	}

	/**
	 * handlePasswordLogin handles the login request and returns the session
	 * token
	 *
	 * @param request
	 * @return
	 */
	public AuthResponse handlePasswordLogin(LoginRequestWithProvider request) {
		Users user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(
						() -> new UserNotFoundException("User does not exist"));
		if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword()))
			throw new InvalidCredentials("Invalid Email Or Password");

		Sessions session = sessionService.sessionCreateWithProvider(user, request);
		return new AuthResponse(session.getToken(), user.getId(), user.getEmail(), user.getPhoneNumber());
	}

	/**
	 * Account Creation Path
	 * 
	 * @param request
	 * @return
	 */
	public AuthResponse handleAccountCreation(AccountCreationRequest request) {
		userRepository.findByEmail(request.getEmail()).ifPresent(email -> {
			throw new ExistingUserFoundException("User already exists");
		});
		Users user = userService.getUserFromSession();
		userService.registerUserPassword(user, request);
		Sessions newSession = sessionService.refreshUserToken(user);
		return new AuthResponse(newSession.getToken() , user.getId(), user.getEmail(), user.getPhoneNumber());
	}

}
