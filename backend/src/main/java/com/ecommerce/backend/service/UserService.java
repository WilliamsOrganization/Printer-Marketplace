package com.ecommerce.backend.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * UserService
 */
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
	private final AuthService authService;
    // TODO: FIX ME needs real account creation process for order updates

    /**
     * This check the headers of the request to see if the user is logged in or
     * not
     *
     * @return
     */
    public Users getUserFromSession() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() &&
            auth.getPrincipal() instanceof Users user) {
            return user;
        }
        return createUserAndSession();
    }

    private Users createUserAndSession() {
        Users user = Users.builder().userRole(Users.Role.CUSTOMER).build();
        user = userRepository.save(user);
        authService.sessionCreateWithUserOnly(user);
        return user;
    }
}
