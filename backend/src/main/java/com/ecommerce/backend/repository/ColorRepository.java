/* (C)2026 */
package com.ecommerce.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.Color;

@Repository
public interface ColorRepository extends JpaRepository<Color, Long> {
	Optional<Color> findByIdAndIsDeletedFalse(Long id);

	List<Color> findByIsDeletedFalseAndIsDisabledFalseOrderByNameAsc();

	List<Color> findByIsDeletedFalseOrderByNameAsc();
}
