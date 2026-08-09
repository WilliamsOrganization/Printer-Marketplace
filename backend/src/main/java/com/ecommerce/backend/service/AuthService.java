package com.ecommerce.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.AuthResponse;
import com.ecommerce.backend.dto.LoginRequest;
import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.entity.Users;
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
	private final SessionRepository sessionRepository;

	/**
	 * authenticateFromToken checks if the token is valid and returns the user
	 * 
	 * @param token
	 * @return
	 */
	public Optional<Authentication> authenticateFromToken(String token) {
		if (token == null)
			return Optional.empty();
		Optional<Sessions> sessionOpt = sessionRepository.findbyTokenWithUser(token);

		if (sessionOpt.isEmpty()) {
			log.warn("authenticateFromToken: no session found for token");
			return Optional.empty();
		}
		if (sessionOpt.get().getExpiresAt().isBefore(LocalDateTime.now())) {
			log.warn("authenticateFromToken: session expired for user {}",
					sessionOpt.get().getUser().getEmail());
			return Optional.empty();
		}
		Users user = sessionOpt.get().getUser();
		List<SimpleGrantedAuthority> authorities = new ArrayList<>();
		authorities.add(
				new SimpleGrantedAuthority("ROLE_" + user.getUserRole().name()));
		if (Boolean.TRUE.equals(user.getIsAdmin())) {
			authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
		}
		return Optional.of(
				new UsernamePasswordAuthenticationToken(user, null, authorities));
	}

	/**
	 * handleLogin handles the login request and returns the session token
	 * 
	 * @param request
	 * @return 
	 */
	public AuthResponse handleLogin(LoginRequest request) {
		Users user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(
						() -> new UserNotFoundException("User does not exist"));
		Sessions session = sessionCreateWithProvider(user, request);
		return new AuthResponse(session.getToken(), user.getId());
	}

	/**
	 * handlePasswordLogin handles the login request and returns the session
	 * token
	 * 
	 * @param request
	 * @return
	 */
	public AuthResponse handlePasswordLogin(LoginRequest request) {
		Users user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(
						() -> new UserNotFoundException("User does not exist"));
		// this exists if the user logged in previously through oauth and hasn't
		// set a password
		if (user.getPassword() == null ||
				!user.getPassword().equals(request.getPassword()))
			throw new InvalidCredentials("Invalid Email Or Password");
		// TODO: requires email authentication layer ie copy past password
		// TODO: NEEDS PASSWORD HASHING PROPERLY!!!

		Sessions session = sessionCreateWithProvider(user, request);
		return new AuthResponse(session.getToken(), user.getId());
	}

	/**
	 * handleOAuthLogin handles the login request and returns the session token
	 * 
	 * @param request
	 * @return
	 */
	private Sessions sessionCreateWithProvider(Users user, LoginRequest request) {
		Sessions session = sessionRepository.findByUser(user).orElseGet(() -> {
			Sessions newSession = Sessions.builder().user(user).build();
			return newSession;
		});
		session.setExpiresAt(LocalDateTime.now().plusDays(DAYS));
		session.setProviderAccountID(request.getProviderAccountID());
		return sessionRepository.save(session);
	}

	/**
	 * handles account session creation for users who have not yet logged in or have an account
	 * 
	 * @param request
	 * @return
	 */
	public Sessions sessionCreateWithUserOnly(Users user) {
		Sessions session = sessionRepository.findByUser(user).orElseGet(() -> {
			Sessions newSession = Sessions.builder().user(user).build();
			return newSession;
		});
		session.setExpiresAt(LocalDateTime.now().plusDays(DAYS));
		return sessionRepository.save(session);
	}
}
