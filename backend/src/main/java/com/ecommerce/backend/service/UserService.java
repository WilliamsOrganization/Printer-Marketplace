package com.ecommerce.backend.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.UpdateContactRequest;
import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * UserService
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
	private final UserRepository userRepository;
	private final SessionService sessionService;

    /**
     * Returns the current request's user, lazily creating and attaching one
     * to the current session if it doesn't have one yet. SessionAuthFilter
     * guarantees a session is always present; it does not guarantee that
     * session already has a user (see Sessions.user's nullability).
     *
     * @return
     */
    public Users getUserFromSession() {
        Sessions session = (Sessions) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (session.getUser() != null) {
            log.info("getUserFromSession: session {} (token={}) already has user {}",
                    session.getId(), session.getToken(), session.getUser().getId());
            return session.getUser();
        }
        log.info("getUserFromSession: session {} (token={}) has no user yet, creating one",
                session.getId(), session.getToken());
        return sessionService.attachNewUserToSession(session);
    }

	/**
	 * adds the email to the user
	 * @param user
	 * @param email
	 */
	public Users updateEmail(Users user, String email) {
		user.setEmail(email);
		userRepository.save(user);
		return user;
	}

	/**
	 * Updates the current session's user with optional contact info. Null
	 * fields on the request are left unchanged, so a partial update (email
	 * only, or phone only) doesn't wipe the other field.
	 *
	 * @param user    the user to update
	 * @param request fields to update; null fields are left unchanged
	 */
	public Users updateContactInfo(Users user, UpdateContactRequest request) {
		if (request.email() != null) {
			user.setEmail(request.email());
		}
		if (request.phoneNumber() != null) {
			user.setPhoneNumber(request.phoneNumber());
		}
		userRepository.save(user);
		return user;
	}
}
