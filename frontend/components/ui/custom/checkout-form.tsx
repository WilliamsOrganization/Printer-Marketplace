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
import { AnimatePresence, motion } from "framer-motion";
import apiSession from "@/lib/api";
import { toast } from "sonner";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { AddressInput } from "./address-input";

const MotionCard = motion(Card);

interface AddressComponents {
	street1: string;
	city: string;
	zip: string;
	state: string;
	country: string;
}

interface ShippingRate {
	object_id: string;
	provider: string;
	servicelevel: { name: string };
	amount: string;
	currency: string;
	estimated_days: number;
}

/**
 * Two-step checkout: collects contact info and a shipping address, fetches
 * shipping rate quotes for that address, then creates a Stripe checkout
 * session for the selected rate and redirects the browser to it.
 */
export function CheckoutForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [address, setAddress] = useState<AddressComponents | null>(null)
	const [rates, setRates] = useState<ShippingRate[]>([])
	const [selectedRate, setSelectedRate] = useState<string | null>(null)
	const [phone, setPhone] = useState<string | undefined>()

	/**
	 * Fetches shipping rate quotes for the currently selected address.
	 */
	const handleCheckout = async function() {
		setError(null)

		if (!address) {
			setError("Please select an address from the suggestions.")
			return
		}
		setLoading(true)

		// BUG: Backend may return empty rates on first request for a new address.
		// See ShippoService.getShipmentRates() - a retry is attempted server-side but may still fail.
		// If "No shipping options available" appears, the user can retry manually.
		// TODO: migrate this and all other request over to tanstack query
		apiSession
			.post("/shipping/rates/test", {
				name: "Customer",
				phone,
				...address,
			})
			.then((res) => {
				const results = Array.isArray(res.data) ? res.data : res.data?.results ?? []
				setRates(results)
				if (results.length === 0) {
					toast.error("No shipping options available for this address")
					// file number in the section header. time of incident what happened. window things stolen. drivers license. include camera's 
				}
			})
			.catch(() => {
				toast.error("Failed to get shipping rates")
			})
			.finally(() => {
				setLoading(false)
			})
	}
	/**
	 * Creates a Stripe checkout session for the selected shipping rate and
	 * navigates the browser to Stripe's hosted checkout page.
	 *
	 * @param selectedRate the id of the chosen shipping rate
	 */
	const createCheckoutSession = async function(selectedRate: string) {
		setError(null)
		setLoading(true)
		apiSession
			.post("cart/checkout/", {
				selectedShippingID: selectedRate
			})
			.then((res) => {
				const results = res?.data
				console.log(results)
				// Leave loading=true: we're navigating away and an order was
				// already created server-side, so the button should stay
				// disabled rather than re-enable in the gap before the
				// browser actually leaves this page.
				window.location.href = results
			})
			.catch((error) => {
				toast.error("Failed to get checkoutsession ")
				console.log("Failed to get checkoutsession ", error)
				setLoading(false)
			})
	}

	return (
		<div className={cn("flex flex-row gap-6", className)} {...props}>
			<MotionCard
				className="min-w-sm"
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<CardHeader>
					<CardTitle className="text-xl">Checkout</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={(e) => { e.preventDefault(); handleCheckout() }}>
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
								<FieldLabel htmlFor="phone">Phone</FieldLabel>
								<PhoneInput
									id="phone"
									name="phone"
									defaultCountry="CA"
									placeholder="(555) 555-5555"
									value={phone}
									onChange={setPhone}
									className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="address">Shipping Address</FieldLabel>
								<AddressInput onAddressSelect={(addr) => {
									setAddress(addr)
									setRates([])
									setSelectedRate(null)
								}} />
							</Field>
							<Field>
								<Button type="submit" disabled={loading}>
									{loading ? "Getting rates..." : "Get Shipping Rates"}
								</Button>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</MotionCard>
			<AnimatePresence>
				{rates.length > 0 && (
					<MotionCard
						className="min-w-sm"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 20 }}
						transition={{ duration: 0.3 }}
					>
						<CardHeader>
							<CardTitle className="text-xl">Shipping Options</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-3">
								{rates.map((rate) => (
									<label
										key={rate.object_id}
										className={cn(
											"flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm transition-colors",
											selectedRate === rate.object_id
												? "border-primary bg-primary/5"
												: "border-border hover:bg-accent/50"
										)}
									>
										<div className="flex items-center gap-3">
											<input
												type="radio"
												name="shippingRate"
												value={rate.object_id}
												checked={selectedRate === rate.object_id}
												onChange={() => setSelectedRate(rate.object_id)}
												className="accent-primary"
											/>
											<div>
												<p className="font-medium">{rate.servicelevel?.name}</p>
												<p className="text-muted-foreground text-xs">{rate.provider}{rate.estimated_days ? ` · ${rate.estimated_days} days` : ""}</p>
											</div>
										</div>
										<p className="font-medium">${rate.amount} {rate.currency}</p>
									</label>
								))}
							</div>
							<Button
								className="mt-4 w-full"
								disabled={!selectedRate || loading}
								onClick={() => {
									if (!selectedRate) return
									createCheckoutSession(selectedRate)
									console.log("selected rate:", selectedRate)
								}}
							>
								{loading ? "Redirecting to payment..." : "Continue to Payment"}
							</Button>
						</CardContent>
					</MotionCard>
				)}
			</AnimatePresence>
		</div>
	);
}
