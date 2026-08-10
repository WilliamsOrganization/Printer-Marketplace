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
	 * Resolves the session for a request's bearer token, creating a brand
	 * new session (with no user attached yet) if the token is missing,
	 * unknown, or expired. Sessions are cheap and created for any request;
	 * a user is only attached lazily, once something actually needs one
	 * (see attachNewUserToSession).
	 *
	 * @param token the bearer token from the request, or null
	 * @return the resolved (existing or newly-created) session
	 */
	public Sessions resolveOrCreateSession(String token, boolean allowCreate) {
		if (token != null) {
			Optional<Sessions> sessionOpt = sessionRepository.findbyTokenWithUser(token);
			if (sessionOpt.isPresent()
					&& sessionOpt.get().getExpiresAt().isAfter(LocalDateTime.now())) {
				Sessions existing = sessionOpt.get();
				log.info("resolveOrCreateSession: token {} -> session {} (userId={})",
						token, existing.getId(),
						existing.getUser() != null ? existing.getUser().getId() : null);
				return existing;
			}
			log.warn("resolveOrCreateSession: token {} missing/unknown/expired (found={}, expired={})",
					token, sessionOpt.isPresent(),
					sessionOpt.map(s -> s.getExpiresAt().isBefore(LocalDateTime.now())).orElse(null));
		}
		if (!allowCreate) {
			log.info("resolveOrCreateSession: no valid token and creation not allowed on this route, proceeding anonymously");
			return null;
		}
		Sessions session = Sessions.builder().build();
		session.setExpiresAt(LocalDateTime.now().plusDays(DAYS));
		session = sessionRepository.save(session);
		log.info("resolveOrCreateSession: created new session {} (token={})", session.getId(), session.getToken());
		return session;
	}

	/**
	 * Lazily creates a guest user and attaches it to a session that doesn't
	 * have one yet - called only by code paths that actually need a user
	 * (e.g. adding to a cart), not on every request.
	 *
	 * @param session the current, userless session
	 * @return the newly-created user
	 */
	public Users attachNewUserToSession(Sessions session) {
		Users user = userRepository.save(Users.builder().userRole(Users.Role.CUSTOMER).build());
		log.info("attachNewUserToSession: created user {} for session {} (token={})",
				user.getId(), session.getId(), session.getToken());
		session.setUser(user);
		sessionRepository.save(session);
		return user;
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
