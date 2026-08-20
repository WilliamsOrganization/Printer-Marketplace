package com.ecommerce.backend.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.AccountCreationRequest;
import com.ecommerce.backend.dto.UpdateContactRequest;
import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.exception.ExistingUserFoundException;
import com.ecommerce.backend.exception.ForbiddenException;
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
	private final PasswordEncoder passwordEncoder;

	/**
	 * Returns the current request's user, lazily creating and attaching one
	 * to the current session if it doesn't have one yet. SessionAuthFilter
	 * guarantees a session is always present; it does not guarantee that
	 * session already has a user (see Sessions.user's nullability).
	 *
	 * @return
	 */
	public Users getUserFromSession() {
		Sessions session = (Sessions) SecurityContextHolder.getContext()
				.getAuthentication()
				.getPrincipal();
		if (session.getUser() != null) {
			log.info(
					"getUserFromSession: session {} (token={}) already has user {}",
					session.getId(), session.getToken(), session.getUser().getId());
			return session.getUser();
		}
		log.info("getUserFromSession: session {} (token={}) has no user yet, " +
				"creating one",
				session.getId(), session.getToken());
		return sessionService.attachNewUserToSession(session);
	}

	/**
	 * Updates the current session's user with optional contact info. Null
	 * fields on the request are left unchanged, so a partial update (email
	 * only, or phone only) doesn't wipe the other field.
	 *
	 * @param user    the user to update
	 * @param request fields to update; null fields are left unchanged
	 */
	public Users updateContactInfo(Users user, UpdateContactRequest request)
			throws ExistingUserFoundException {
		if (request.email() != null &&
				!request.email().equals(user.getEmail())) {
			if (user.getUserRole() != Users.Role.CUSTOMER) {
				throw new ForbiddenException(
						"Registered accounts must change their email through the verified email-change flow");
			}
			userRepository.findByEmail(request.email()).ifPresent(existing -> {
				throw new ExistingUserFoundException(
						"Email " + request.email() + " is already in use");
			});
			user.setEmail(request.email());
		}
		if (request.phoneNumber() != null &&
				!request.phoneNumber().equals(user.getPhoneNumber())) {
			userRepository.findByPhoneNumber(request.phoneNumber())
					.ifPresent(existing -> {
						throw new ExistingUserFoundException(
								"Phone number " + request.phoneNumber() +
										" is already in use");
					});
			user.setPhoneNumber(request.phoneNumber());
		}
		userRepository.save(user);
		return user;
	}

	/**
	 * Registers a new user, setting their role to REGISTERED.
	 *
	 * @param user
	 * @return
	 */
	public Users registerUser(Users user) {
		if (user.getUserRole() != Users.Role.ADMIN)
			user.setUserRole(Users.Role.REGISTERED);
		return userRepository.save(user);
	}

	/**
	 * creates new user from password parameters
	 *
	 * @param AccountCreationRequest
	 */
	public Users registerUserPassword(Users user, AccountCreationRequest request) {
		user.setEmail(request.getEmail());
		user.setPhoneNumber(request.getPhoneNumber());
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		return registerUser(user);
	}

	/**
	 * Sets a new password for the user, once the caller has already
	 * verified ownership of the account (see AuthService.verifyCode).
	 *
	 * @param user the user to update
	 * @param rawPassword the new password, not yet hashed
	 */
	public Users resetPassword(Users user, String rawPassword) {
		user.setPassword(passwordEncoder.encode(rawPassword));
		return userRepository.save(user);
	}

}
