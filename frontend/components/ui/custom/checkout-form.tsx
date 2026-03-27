import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import usePlacesAutocomplete, { getDetails } from "react-google-autocomplete/lib/usePlacesAutocompleteService";

interface AddressComponents {
	street1: string;
	city: string;
	state: string;
	zip: string;
	country: string;
}

export function CheckoutForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [address, setAddress] = useState<AddressComponents | null>(null)
	const [addressInput, setAddressInput] = useState("")
	const [showSuggestions, setShowSuggestions] = useState(false)

	const {
		placesService,
		placePredictions,
		getPlacePredictions,
	} = usePlacesAutocomplete({
		apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
		options: {
			types: ["address"],
			componentRestrictions: { country: ["ca", "us"] },
		},
	})

	const handleSelect = (placeId: string, description: string) => {
		setAddressInput(description)
		setShowSuggestions(false)

		if (!placesService) return

		placesService.getDetails(
			{ placeId, fields: ["address_components"] },
			(place: any) => {
				if (!place?.address_components) return

				const get = (type: string) =>
					place.address_components.find((c: any) => c.types.includes(type))?.long_name ?? ""
				const getShort = (type: string) =>
					place.address_components.find((c: any) => c.types.includes(type))?.short_name ?? ""

				setAddress({
					street1: `${get("street_number")} ${get("route")}`.trim(),
					city: get("locality"),
					state: getShort("administrative_area_level_1"),
					zip: get("postal_code"),
					country: getShort("country"),
				})
			}
		)
	}

	const handleCheckout = async function(formData: FormData) {
		setError(null)

		if (!address) {
			setError("Please select an address from the suggestions.")
			return
		}

		setLoading(true)

		const payload = {
			email: formData.get("email"),
			...address,
		}

		// TODO: submit to backend checkout endpoint
		console.log("checkout payload", payload)
		setLoading(false)
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Checkout</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={(e) => { e.preventDefault(); handleCheckout(new FormData(e.currentTarget)) }}>
						<FieldGroup>
							{error && (
								<p className="text-sm text-red-500">{error}</p>
							)}
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="you@example.com"
									required
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="address">Shipping Address</FieldLabel>
								<div className="relative">
									<Input
										id="address"
										name="address"
										type="text"
										placeholder="Start typing your address..."
										value={addressInput}
										onChange={(e) => {
											setAddressInput(e.target.value)
											setAddress(null)
											getPlacePredictions({ input: e.target.value })
											setShowSuggestions(true)
										}}
										onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
										required
									/>
									{showSuggestions && placePredictions.length > 0 && (
										<ul className="border-border bg-popover text-popover-foreground absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border p-1 shadow-md">
											{placePredictions.map((prediction) => (
												<li
													key={prediction.place_id}
													className="hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm px-3 py-2 text-sm"
													onMouseDown={() => handleSelect(prediction.place_id, prediction.description)}
												>
													{prediction.description}
												</li>
											))}
										</ul>
									)}
								</div>
							</Field>
							<Field>
								<Button type="submit" disabled={loading}>
									{loading ? "Processing..." : "Continue to Payment"}
								</Button>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
