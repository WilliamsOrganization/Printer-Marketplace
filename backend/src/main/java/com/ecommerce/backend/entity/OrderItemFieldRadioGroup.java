package com.ecommerce.backend.entity;

import java.util.List;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.validation.constraints.NotNull;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
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
@DiscriminatorValue("radio_group")
public class OrderItemFieldRadioGroup extends OrderItemField {
    @ManyToMany
    @JoinTable(
        name = "order_radio_group_options",
        joinColumns = @JoinColumn(name = "radio_group_id"),
        inverseJoinColumns = @JoinColumn(name = "options_id")
    )
    @NonNull @NotNull private List<OrderItemFieldOptionsDropdown> options;

    /**
     * Returns the options for this field.
     */
    public List<OrderItemFieldOptionsDropdown> getOptions(){
        return options;
    };

}
