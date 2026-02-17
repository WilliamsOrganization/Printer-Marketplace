package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.Users;

/**
 * UserRepository
 */
public interface UserRepository extends JpaRepository<Users, Long> {
}
