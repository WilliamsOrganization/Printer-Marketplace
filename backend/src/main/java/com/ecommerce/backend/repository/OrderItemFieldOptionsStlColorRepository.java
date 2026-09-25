package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.OrderItemFieldOptionsStlColor;

@Repository
public interface OrderItemFieldOptionsStlColorRepository extends JpaRepository<OrderItemFieldOptionsStlColor, Long> {


}
