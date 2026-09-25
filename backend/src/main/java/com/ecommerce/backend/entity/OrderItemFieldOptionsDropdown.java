package com.ecommerce.backend.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * OrderItemFieldOptionsDropdown is a collection of options for a group of
 * OrderItemFields, such as a size or weight category.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("dropdown")
public class OrderItemFieldOptionsDropdown extends OrderItemFieldOptions {}
