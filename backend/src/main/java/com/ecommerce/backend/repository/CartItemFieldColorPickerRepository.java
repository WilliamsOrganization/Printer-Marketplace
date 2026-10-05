package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.CartItemFieldColorPicker;

@Repository
public interface CartItemFieldColorPickerRepository extends JpaRepository<CartItemFieldColorPicker, Long> {


}
