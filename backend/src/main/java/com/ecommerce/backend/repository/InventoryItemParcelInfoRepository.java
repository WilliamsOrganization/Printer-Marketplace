package com.ecommerce.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.entity.InventoryItemParcelInfo;

/**
 * InventoryItemParcelInformation is the information about the parcel that an inventory item is shipped in
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
public interface InventoryItemParcelInfoRepository extends JpaRepository<InventoryItemParcelInfo, Long> {

	/**
	 * Finds an inventory item by its inventory item.
	 * @param inventoryItem the inventory item
	 * @return the inventory item
	 */
	Optional<InventoryItemParcelInfo> findByInventoryItem(InventoryItem inventoryItem);
}
