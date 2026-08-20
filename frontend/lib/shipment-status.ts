import { Shipping, ShippingAddress } from "@/lib/types";

export interface MapMarker {
	lat: number;
	lng: number;
}

export interface ShipmentStatusDisplay {
	eyebrow: string;
	heading: string;
	description: string;
	addressLabel: string;
	address: ShippingAddress;
	markers: MapMarker[];
}

function markersFrom(
	pairs: [number | null | undefined, number | null | undefined][]
): MapMarker[] {
	return pairs
		.filter((pair): pair is [number, number] => pair[0] != null && pair[1] != null)
		.map(([lat, lng]) => ({ lat, lng }));
}

/**
 * Maps a shipment's Shipping.Status onto the copy/address/map-markers shown
 * on the order-status page - single source of truth so the page, map, and
 * any future admin view stay in sync with the backend's 4-state model.
 */
export function getShipmentStatusDisplay(
	shipping: Shipping,
	customerEmail: string
): ShipmentStatusDisplay {
	switch (shipping.status) {
		case "PURCHASED":
			return {
				eyebrow: "Label purchased",
				heading: "Your order is packed and ready.",
				description:
					"A shipping label has been created and your package is awaiting pickup by the carrier.",
				addressLabel: "Shipping from",
				address: shipping.addressFrom,
				markers: markersFrom([[shipping.fromLat, shipping.fromLng]]),
			};
		case "IN_TRANSIT":
			return {
				eyebrow: "In transit",
				heading: "Your order is on its way.",
				description: shipping.currentLocation
					? `Currently near ${shipping.currentLocation.city}${
							shipping.currentLocation.state ? `, ${shipping.currentLocation.state}` : ""
						}.`
					: "Your package has left the warehouse and is heading to you.",
				addressLabel: "Shipping to",
				address: shipping.addressTo,
				markers: markersFrom([
					[shipping.currentLat, shipping.currentLng],
					[shipping.lat, shipping.lng],
				]),
			};
		case "DELIVERED":
			return {
				eyebrow: "Delivered",
				heading: "Your order has arrived.",
				description: "Your package was delivered to the address below.",
				addressLabel: "Delivered to",
				address: shipping.addressTo,
				markers: markersFrom([[shipping.lat, shipping.lng]]),
			};
		case "PENDING":
		default:
			return {
				eyebrow: "Order confirmed",
				heading: "Thank you for your order.",
				description: `A confirmation will be sent to ${customerEmail}. We'll begin printing shortly.`,
				addressLabel: "Shipping to",
				address: shipping.addressTo,
				markers: markersFrom([[shipping.lat, shipping.lng]]),
			};
	}
}
