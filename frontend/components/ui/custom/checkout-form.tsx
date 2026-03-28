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
import api from "@/lib/api";
import { toast } from "sonner";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { AddressInput } from "./address-input";

const MotionCard = motion(Card);

interface AddressComponents {
	street1: string;
	city: string;
	state: string;
	zip: string;
	country: string;
}

interface ShippingRate {
	objectId: string;
	provider: string;
	servicelevel: { name: string };
	amount: string;
	currency: string;
	estimatedDays: number;
}

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

	const handleCheckout = async function(formData: FormData) {
		setError(null)

		if (!address) {
			setError("Please select an address from the suggestions.")
			return
		}

		setLoading(true)

		api
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
				}
			})
			.catch(() => {
				toast.error("Failed to get shipping rates")
			})
			.finally(() => {
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
										key={rate.objectId}
										className={cn(
											"flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm transition-colors",
											selectedRate === rate.objectId
												? "border-primary bg-primary/5"
												: "border-border hover:bg-accent/50"
										)}
									>
										<div className="flex items-center gap-3">
											<input
												type="radio"
												name="shippingRate"
												value={rate.objectId}
												checked={selectedRate === rate.objectId}
												onChange={() => setSelectedRate(rate.objectId)}
												className="accent-primary"
											/>
											<div>
												<p className="font-medium">{rate.servicelevel?.name}</p>
												<p className="text-muted-foreground text-xs">{rate.provider}{rate.estimatedDays ? ` · ${rate.estimatedDays} days` : ""}</p>
											</div>
										</div>
										<p className="font-medium">${rate.amount} {rate.currency}</p>
									</label>
								))}
							</div>
							<Button
								className="mt-4 w-full"
								disabled={!selectedRate}
								onClick={() => {
									// TODO: proceed to Stripe checkout with selected rate
									console.log("selected rate:", selectedRate)
								}}
							>
								Continue to Payment
							</Button>
						</CardContent>
					</MotionCard>
				)}
			</AnimatePresence>
		</div>
	);
}
