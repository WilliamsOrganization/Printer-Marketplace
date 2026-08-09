package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * SessionService
 */
@Service
@RequiredArgsConstructor
public class SessionService {
    private final SessionRepository sessionRepository;
	private final UserService userService;

    /**
     * getSession returns the session for the current user
     *
     * @return
     */
    public Sessions getSession() {
        return sessionRepository.findByUser(userService.getUserFromSession()).orElseThrow();
    }
}
