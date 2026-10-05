package com.ecommerce.backend.entity;

import java.util.ArrayList;
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
 * OrderItemGroupOptions is a collection of options for a group of
 * OrderItemFields, such as a size or weight category.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("checklist")
public class OrderItemFieldChecklist extends OrderItemField {

    
    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
        name = "order_checklist_options",
        joinColumns = @JoinColumn(name = "checklist_id"),
        inverseJoinColumns = @JoinColumn(name = "options_id")
    )
    @NonNull @NotNull private List<OrderItemFieldOptionsDropdown> options;

    /**
     * Returns the selected options for this field.
     */
    public List<OrderItemFieldOptionsDropdown> getOptions(){
        return options;
    };

    /**
     * Copies a cart checklist and its selected options into the order.
     */
    public static OrderItemFieldChecklist from(CartItemFieldChecklist source) {
        List<OrderItemFieldOptionsDropdown> options = new ArrayList<>();
        for (CartItemFieldOptionsDropdown option : source.getOptions()) {
            options.add(OrderItemFieldOptionsDropdown.from(option));
        }
        return builder()
                .label(source.getLabel())
                .description(source.getDescription())
                .options(options)
                .build();
    }
}
