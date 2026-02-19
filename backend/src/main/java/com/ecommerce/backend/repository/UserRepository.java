package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Users;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Data access layer for User entities.
 */
public interface UserRepository extends JpaRepository<Users, Long> {
	Optional<Users> findByEmail(String email);
}
