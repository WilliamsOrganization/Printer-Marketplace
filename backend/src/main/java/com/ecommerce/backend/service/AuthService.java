package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.AuthResponse;
import com.ecommerce.backend.dto.LoginRequest;
import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.entity.Users.Role;
import com.ecommerce.backend.exception.InvalidCredentials;
import com.ecommerce.backend.exception.UserNotFoundException;
import com.ecommerce.backend.repository.CartRepository;
import com.ecommerce.backend.repository.SessionRepository;
import com.ecommerce.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Service;

/**
 * AuthService handles all of the business logic for logging in
 */
@Service
@RequiredArgsConstructor
public class AuthService {
	private final UserRepository userRepository;
	private final SessionRepository sessionRepository;
	private final CartRepository cartRepository;

	public Optional<Authentication> authenticateFromToken(String token) {
		if (token == null)
			return Optional.empty();
		Optional<Sessions> sessionOpt = sessionRepository.findbyTokenWithUser(token);

		if (sessionOpt.isEmpty() ||
				sessionOpt.get().getExpiresAt().isBefore(LocalDateTime.now())) {
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

	public AuthResponse handleLogin(LoginRequest request) {
		Users user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(
						() -> new UserNotFoundException("User does not exist"));
		Sessions session = sessionCreate(user, request);
		return new AuthResponse(session.getToken(), user.getId());
	}

	public AuthResponse handlePasswordLogin(LoginRequest request) {
		Users user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(
						() -> new UserNotFoundException("User does not exist"));
		// this exists if the user logged in previously through oauth and hasn't
		// set a password
		if (user.getPassword() == null || !user.getPassword().equals(request.getPassword()))
			throw new InvalidCredentials("Invalid Email Or Password");
		// TODO: requires email authentication layer ie copy past password
		// TODO: NEEDS PASSWORD HASHING PROPERLY!!!

		Sessions session = sessionCreate(user, request);
		return new AuthResponse(session.getToken(), user.getId());
	}

	private Users createUser(LoginRequest request) {
		Users user = new Users();
		user.setEmail(request.getEmail());
		user.setUserRole(Role.CUSTOMER);
		user.setIsAdmin(false);
		return userRepository.save(user);
	}

	private Sessions sessionCreate(Users user, LoginRequest request) {
		Sessions session = sessionRepository.findByUser(user).orElseGet(() -> {
			Sessions sessionNew = new Sessions();
			sessionNew.setUser(user);
			sessionNew.setExpiresAt(LocalDateTime.now().plusDays(30));
			sessionNew.setProviderAccountID(request.getProviderAccountID());
			return sessionNew;
		});
		return sessionRepository.save(session);
	}
}
