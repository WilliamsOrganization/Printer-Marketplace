package com.ecommerce.backend.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.entity.Users;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * UserService
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final AuthService authService;

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
        return authService.attachNewUserToSession(session);
    }
}
