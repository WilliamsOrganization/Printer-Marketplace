'use client'

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { Shipping } from '@/lib/types'

/**
 * Single-marker map for a shipment - prefers its current tracking
 * checkpoint (from the Shippo track_updated webhook) over the fixed
 * destination, same fallback used on the admin shipments map. Renders
 * nothing if neither coordinate is known yet (e.g. the label hasn't been
 * purchased/geocoded).
 */
export function ShipmentTrackingMap({ shipping }: { shipping: Shipping }) {
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
	})

	const lat = shipping.currentLat ?? shipping.lat
	const lng = shipping.currentLng ?? shipping.lng

	if (!isLoaded || lat == null || lng == null) return null

	return (
		<div className="w-full h-[200px] overflow-hidden rounded-lg border">
			<GoogleMap
				center={{ lat, lng }}
				zoom={10}
				options={{ disableDefaultUI: true, zoomControl: true }}
				mapContainerStyle={{ width: "100%", height: "100%" }}
			>
				<Marker position={{ lat, lng }} />
			</GoogleMap>
		</div>
	)
}

export default ShipmentTrackingMap
