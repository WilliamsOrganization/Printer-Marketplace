package com.ecommerce.backend.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
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
 * CartItemFieldChecklist holds the options a customer selected for a
 * checklist field on an item in their cart.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("checklist")
public class CartItemFieldChecklist extends CartItemField {

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
        name = "cart_checklist_options",
        joinColumns = @JoinColumn(name = "checklist_id"),
        inverseJoinColumns = @JoinColumn(name = "options_id")
    )
    @NonNull @NotNull private List<CartItemFieldOptionsDropdown> options;

    /**
     * Returns the selected options for this field.
     */
    public List<CartItemFieldOptionsDropdown> getOptions(){
        return options;
    };
}
