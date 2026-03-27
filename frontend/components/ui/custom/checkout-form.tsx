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
import Autocomplete from "react-google-autocomplete";

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

	const handlePlaceSelected = (place: any) => {
		console.log("place object:", place)
		if (!place?.address_components) return

		const get = (type: string) =>
			place.address_components.find((c: any) => c.types.includes(type))?.long_name ?? ""
		const getShort = (type: string) =>
			place.address_components.find((c: any) => c.types.includes(type))?.short_name ?? ""

		const parsed = {
			street1: `${get("street_number")} ${get("route")}`.trim(),
			city: get("locality"),
			state: getShort("administrative_area_level_1"),
			zip: get("postal_code"),
			country: getShort("country"),
		}
		console.log("raw address_components:", place.address_components)
		console.log("parsed address:", parsed)
		setAddress(parsed)
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
								<Autocomplete
									apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
									onPlaceSelected={handlePlaceSelected}
									options={{
										types: ["address"],
										componentRestrictions: { country: ["ca", "us"] },
									}}
									placeholder="Start typing your address..."
									className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
								/>
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
