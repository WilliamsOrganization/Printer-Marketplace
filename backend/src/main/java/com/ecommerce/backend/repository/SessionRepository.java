package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.Sessions;

/**
 * Session access layer for main Authentication route
 */
public interface SessionRepository extends JpaRepository<Sessions, Long> {
}
