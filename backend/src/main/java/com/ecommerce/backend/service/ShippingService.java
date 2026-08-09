package com.ecommerce.backend.service;

import org.springframework.stereotype.Service;

import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.entity.InventoryItemParcelInfo;
import com.ecommerce.backend.entity.Shipping;
import com.ecommerce.backend.repository.InventoryItemParcelInfoRepository;
import com.ecommerce.backend.repository.ShippingRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Shipping Service that handles all shipping operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ShippingService {
    private final InventoryItemParcelInfoRepository
        inventoryItemParcelInfoRepository;
    private final ShippingRepository shippingRepository;

    /**
     * Saves the shipping information for an inventory item
     *
     * @author William Ewanchuk https://github.com/ewanchukwilliam
     */
    public InventoryItemParcelInfo saveInventoryItemShippingInformation(
        InventoryItem inventoryItemId, InventoryItemParcelInfo parcelItem){
        return inventoryItemParcelInfoRepository.save(parcelItem);
    }

    /**
     * Saves Shipping location address information
     *
     * @author William Ewanchuk https://github.com/ewanchukwilliam
     */
    public Shipping createShippingAddress(Shipping shipping){
		// TODO: validate this logic here
        return shippingRepository.save(shipping);
    }
}
