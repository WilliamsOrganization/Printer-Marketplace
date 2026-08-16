'use client'

import { useMemo, useRef } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { useDashboard } from '@/src/context/dashboard-context'
import { Shipping } from '@/lib/types'
import { GOOGLE_MAPS_LIBRARIES } from '@/lib/google-maps'
import ShipmentsTable, { getShippedOrders, type ShippedOrder } from './shipments-table'

export default function ShipmentsAdmin() {
	// TODO: needs a way to add existing shipment parcel sizes with most frequently used recommended.
	// SHARE THE MAPS COMPONENT WITH THE ORDER COMPLETION PAGE.
	// SHAREABLE LINK TO THE SHIPPMENTS PAGE (potentially via email?)
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
		libraries: GOOGLE_MAPS_LIBRARIES,
	})
	const { orders, setOrders } = useDashboard()
	const shipments = useMemo(() => getShippedOrders(orders), [orders])
	const mapRef = useRef<google.maps.Map | null>(null)

	const handleLabelCreated = (orderId: number, shipping: Shipping) => {
		setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, shipping } : order)))
	}

	// If both the current checkpoint (from the Shippo track_updated webhook)
	// and the fixed destination are known, fit the viewport to show both at
	// once. Otherwise fall back to whichever single point is available -
	// current checkpoint preferred, destination if that's all there is.
	const handleRowClick = (order: ShippedOrder) => {
		if (!mapRef.current) return
		const { lat, lng, currentLat, currentLng } = order.shipping

		if (lat != null && lng != null && currentLat != null && currentLng != null) {
			const bounds = new google.maps.LatLngBounds()
			bounds.extend({ lat: currentLat, lng: currentLng })
			bounds.extend({ lat, lng })
			mapRef.current.fitBounds(bounds, 64)
			return
		}

		const focusLat = currentLat ?? lat
		const focusLng = currentLng ?? lng
		if (focusLat == null || focusLng == null) return
		mapRef.current.panTo({ lat: focusLat, lng: focusLng })
		mapRef.current.setZoom(12)
	}

	// Coordinates are geocoded once, server-side - at order-creation time for
	// the destination (see GoogleMapsService/OrderService), and on each
	// carrier scan for the current checkpoint (see
	// ShippingService.applyTrackingUpdate) - so this never has to geocode
	// anything itself, just read lat/lng off the row.
	const destinationMarkers = shipments.filter(
		(order) => order.shipping.lat != null && order.shipping.lng != null,
	)
	const currentMarkers = shipments.filter(
		(order) => order.shipping.currentLat != null && order.shipping.currentLng != null,
	)

	if (!isLoaded) return null

	const center = destinationMarkers[0]
		? { lat: destinationMarkers[0].shipping.lat!, lng: destinationMarkers[0].shipping.lng! }
		: { lat: 53.5461, lng: -113.4938 } // Edmonton, as a fallback with no shipments yet

	return (
		<div className="flex flex-row gap-4">
			<div className="flex-1">
				<ShipmentsTable
					shipments={shipments}
					onShippingUpdated={handleLabelCreated}
					onRowClick={handleRowClick}
				/>
			</div>

			<div className="min-w-[25vw] min-h-[25vh] max-w-[33.333vw] overflow-hidden rounded-lg border">
				<GoogleMap
					center={center}
					zoom={5}
					onLoad={(map) => {
						mapRef.current = map
					}}
					mapContainerStyle={{
						width: "100%",
						height: "100%"
					}}
				>
					{destinationMarkers.map((order) => (
						<Marker
							key={`dest-${order.id}`}
							position={{ lat: order.shipping.lat!, lng: order.shipping.lng! }}
						/>
					))}
					{currentMarkers.map((order) => (
						<Marker
							key={`current-${order.id}`}
							position={{ lat: order.shipping.currentLat!, lng: order.shipping.currentLng! }}
							icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
						/>
					))}
				</GoogleMap>
			</div>
		</div>
	)
}
