package com.ecommerce.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
}
