package com.ecommerce.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entity.OrderItemFieldOptionsDropdown;

@Repository
public interface OrderItemFieldOptionsDropdownRepository extends JpaRepository<OrderItemFieldOptionsDropdown, Long> {


}
