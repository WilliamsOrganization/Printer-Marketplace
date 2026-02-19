package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.AuthResponse;
import com.ecommerce.backend.dto.LoginRequest;
import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.entity.Users.Role;
import com.ecommerce.backend.exception.UserNotFoundException;
import com.ecommerce.backend.repository.SessionRepository;
import com.ecommerce.backend.repository.UserRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * AuthService
 */
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;

    public AuthResponse handleLogin(LoginRequest request) {
        Users user = userRepository.findByEmail(request.getEmail()).orElseThrow(()->new UserNotFoundException("User does not exist"));
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
        Sessions session = new Sessions();
        session.setUser(user);
        session.setExpiresAt(LocalDateTime.now().plusDays(30));
		session.setProviderAccountID(request.getProviderAccountID());
		session.setDeviceInfo(request.getDeviceInfo());
        return sessionRepository.save(session);
    }
}
