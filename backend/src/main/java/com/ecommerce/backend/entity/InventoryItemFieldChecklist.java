package com.ecommerce.backend.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * InventoryItemGroupOptions is a collection of options for a group of
 * InventoryItemFields, such as a size or weight category.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("checklist")
public class InventoryItemFieldChecklist extends InventoryItemField {

    
    @OneToMany(mappedBy = "inventoryItemField", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @NonNull @NotNull private List<InventoryItemFieldOptionsDropdown> options;

    /**
     * Returns the options for this field.
     */
    public List<InventoryItemFieldOptionsDropdown> getOptions(){
        return options;
    };
}
