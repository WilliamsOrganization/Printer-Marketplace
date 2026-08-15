package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.repository.SessionRepository;
import com.ecommerce.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * SessionService
 */
@Service
@RequiredArgsConstructor
public class SessionService {
    private final SessionRepository sessionRepository;
	private final UserRepository userRepository;

	/**
	 * create session and attach a user to it
	 *
	 * @param user
	 * @return
	 */
	public Sessions createSession() {
		Sessions session = Sessions.builder().build();
		attachNewUserToSession(session);
		sessionRepository.save(session);
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
		session.setUser(user);
		sessionRepository.save(session);
		return user;
	}

	/**
	 * Returns the current request's session if it extists from the request headers
	 * @return
	 */
	public Sessions getSessionFromContext() {
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		if (principal instanceof Sessions session) {
			return session;
		}
		return null;
	}
}
