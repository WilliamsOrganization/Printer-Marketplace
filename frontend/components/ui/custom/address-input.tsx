import { Input } from "@/components/ui/input";
import { useJsApiLoader } from "@react-google-maps/api";
import usePlacesAutocomplete, { getGeocode } from "use-places-autocomplete";

const libraries: ("places")[] = ["places"];

interface AddressComponents {
	street1: string;
	city: string;
	state: string;
	zip: string;
	country: string;
}

interface AddressInputProps {
	onAddressSelect: (address: AddressComponents) => void;
}

export function AddressInput({ onAddressSelect }: AddressInputProps) {
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
		libraries,
	})

	const {
		value,
		suggestions: { data: suggestions },
		setValue,
		clearSuggestions,
	} = usePlacesAutocomplete({
		requestOptions: {
			types: ["address"],
			componentRestrictions: { country: ["ca", "us"] },
		},
		debounce: 300,
		initOnMount: isLoaded,
	})

	const handleSelect = async (placeId: string, description: string) => {
		setValue(description, false)
		clearSuggestions()

		const results = await getGeocode({ placeId })
		const place = results[0]
		if (!place?.address_components) return

		const get = (type: string) =>
			place.address_components.find((c: any) => c.types.includes(type))?.long_name ?? ""
		const getShort = (type: string) =>
			place.address_components.find((c: any) => c.types.includes(type))?.short_name ?? ""

		onAddressSelect({
			street1: `${get("street_number")} ${get("route")}`.trim(),
			city: get("locality"),
			state: getShort("administrative_area_level_1"),
			zip: get("postal_code"),
			country: getShort("country"),
		})
	}

	return (
		<div className="relative" onBlur={() => setTimeout(() => clearSuggestions(), 150)}>
			<Input
				id="address"
				autoComplete="off"
				placeholder="Start typing your address..."
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={(e) => {
					const items = e.currentTarget.parentElement?.querySelectorAll<HTMLElement>("[data-suggestion]")
					if (!items?.length) return
					const active = e.currentTarget.parentElement?.querySelector<HTMLElement>("[data-active]")
					const idx = active ? Array.from(items).indexOf(active) : -1
					if (e.key === "ArrowDown") {
						e.preventDefault()
						active?.removeAttribute("data-active")
						items[(idx + 1) % items.length].setAttribute("data-active", "")
					} else if (e.key === "ArrowUp") {
						e.preventDefault()
						active?.removeAttribute("data-active")
						items[(idx - 1 + items.length) % items.length].setAttribute("data-active", "")
					} else if (e.key === "Enter" && active) {
						e.preventDefault()
						active.click()
					}
				}}
			/>
			{suggestions.length > 0 && (
				<div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
					{suggestions.map((suggestion) => (
						<div
							key={suggestion.place_id}
							data-suggestion
							className="cursor-pointer px-3 py-2 text-sm hover:bg-accent data-[active]:bg-accent"
							onClick={() => handleSelect(suggestion.place_id, suggestion.description)}
						>
							{suggestion.description}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
