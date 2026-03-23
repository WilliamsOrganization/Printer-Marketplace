package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.repository.SessionRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for Session account operations.
 */
@RestController
@RequestMapping("/server/session")
public class SessionController {
	private final SessionRepository repository;

	public SessionController(SessionRepository repository) {
		this.repository = repository;
	}

	@GetMapping("/stats")
	public Map<String, Long> getStats() {
		return Map.of(
			"totalSessions", repository.count(),
			"activeSessions", repository.countByExpiresAtAfter(LocalDateTime.now()),
			"uniqueUsers", repository.countUniqueUsers());
	}

	@GetMapping("/dates")
	public List<LocalDateTime> getDates() {
		return repository.findAll().stream()
				.map(Sessions::getCreatedAt)
				.toList();
	}

	// @GetMapping
	// public List<Sessions> getAll() {
	// return repository.findAll();
	// }
	//
	// @GetMapping("/{id}")
	// public Sessions getOne(@PathVariable Long id) {
	// return repository.findById(id).orElseThrow();
	// }
	//
	// @PostMapping
	// public Sessions create(@RequestBody Sessions session) {
	// return repository.save(session);
	// }
	//
	// @DeleteMapping("/{id}")
	//
	// public void delete(@PathVariable Long id) {
	// repository.deleteById(id);
	// }
}
