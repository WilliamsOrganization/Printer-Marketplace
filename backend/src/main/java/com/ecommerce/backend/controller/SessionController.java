package com.ecommerce.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.repository.SessionRepository;
import com.ecommerce.backend.service.SessionService;

import lombok.RequiredArgsConstructor;

/**
 * REST controller for Session account operations.
 */
@RestController
@RequestMapping("/server/session")
@RequiredArgsConstructor
public class SessionController {
	private final SessionRepository repository;
	private final SessionService sessionService;


	/**
	 * Single entry point for the application. if a session exists, returns
	 * its token. if not, creates a new session and returns its token.
	 * @return the current session's token
	 */
	@GetMapping
	public String getOrCreateSession() {
		Sessions session = sessionService.getSessionFromContext();
		if (session != null) return session.getToken();
		Sessions newSession = sessionService.createSession();
		return newSession.getToken();
	}

	/**
	 * Gets stats about the current app's sessions.
	 *
	 * @return the stats
	 */
	@GetMapping("/stats")
	@PreAuthorize("hasRole('ADMIN')")
	public Map<String, Long> getStats() {
		return Map.of(
			"totalSessions", repository.count(),
			"activeSessions", repository.countByExpiresAtAfter(LocalDateTime.now()),
			"uniqueUsers", repository.countUniqueUsers());
	}

	/**
	 * Gets a list of all session creation dates.
	 *
	 * @return the dates
	 */
	@GetMapping("/dates")
	@PreAuthorize("hasRole('ADMIN')")
	public List<LocalDateTime> getDates() {
		return repository.findAll().stream()
				.map(Sessions::getCreatedAt)
				.toList();
	}
}
