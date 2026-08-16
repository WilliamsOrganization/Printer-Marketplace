import ShipmentsAdmin from "@/components/ui/admin-shipments"
import { DataTable } from "@/components/ui/data-table"

export default function ShipmentsPage() {
	// TODO: wire up the shipments component.  it will be a ltable of shipments actively being tracked. 
	// Shippo has a webhook that I can poll for updates to tracking location. I can update several statuses as  I go. 
	// I want to use the google maps API to show addresses on the map. 
	// needs a way to add existing shipment parcel sizes with most frequently used recommended. 
	// click to show the shipment on the map
	// click to show the carriens tracking link
	// SHARE THE MAPS COMPONENT WITH THE ORDER COMPLETION PAGE. 
	// SHAREABLE LINK TO THE SHIPPMENTS PAGE (potentially via email?)
	// PDF LINK TO THE GENERATED SHIPMENT LABEL
	return (
		<div className="flex flex-col gap-6">
			<div className="px-4 lg:px-6">
				<ShipmentsAdmin />
			</div>

			<DataTable />
		</div>
	)
}
