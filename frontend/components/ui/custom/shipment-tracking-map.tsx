'use client'

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { GOOGLE_MAPS_LIBRARIES } from '@/lib/google-maps'
import { MapMarker } from '@/lib/shipment-status'

/**
 * Plots the given markers for a shipment - one pin for a fixed point
 * (destination while pending/delivered, pickup while purchased), or two for
 * in-transit (current checkpoint + destination), auto-fitting the bounds so
 * both stay in view. Renders nothing if no marker has known coordinates yet.
 */
export function ShipmentTrackingMap({ markers }: { markers: MapMarker[] }) {
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
		libraries: GOOGLE_MAPS_LIBRARIES,
	})

	if (!isLoaded || markers.length === 0) return null

	const center = markers.length === 1
		? markers[0]
		: {
			lat: (markers[0].lat + markers[1].lat) / 2,
			lng: (markers[0].lng + markers[1].lng) / 2,
		}

	const onLoad = (map: google.maps.Map) => {
		if (markers.length > 1) {
			const bounds = new google.maps.LatLngBounds()
			markers.forEach((marker) => bounds.extend(marker))
			map.fitBounds(bounds)
		}
	}

	return (
		<div className="w-full h-[200px] overflow-hidden rounded-lg border">
			<GoogleMap
				center={center}
				zoom={10}
				onLoad={onLoad}
				options={{ disableDefaultUI: true, zoomControl: true }}
				mapContainerStyle={{ width: "100%", height: "100%" }}
			>
				{markers.map((marker, i) => (
					<Marker key={i} position={marker} />
				))}
			</GoogleMap>
		</div>
	)
}

export default ShipmentTrackingMap
