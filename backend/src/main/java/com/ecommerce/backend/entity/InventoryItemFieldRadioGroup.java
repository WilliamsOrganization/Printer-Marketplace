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
 * InventoryItemFieldOptionsDropdown is a collection of options for a group of
 * InventoryItemFields, such as a size or weight category.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("radio_group")
public class InventoryItemFieldRadioGroup extends InventoryItemField {
    @ManyToMany
    @JoinTable(
        name = "radio_group_options",
        joinColumns = @JoinColumn(name = "radio_group_id"),
        inverseJoinColumns = @JoinColumn(name = "options_id")
    )
    @NonNull @NotNull private List<InventoryItemFieldOptionsDropdown> options;

    /**
     * Returns the options for this field.
     */
    public List<InventoryItemFieldOptionsDropdown> getOptions(){
        return options;
    };

}
