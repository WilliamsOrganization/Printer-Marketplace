package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.OrderItemField;

@Repository
public interface OrderItemFieldRepository extends JpaRepository<OrderItemField, Long> {


}
