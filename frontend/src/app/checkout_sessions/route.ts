import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		const headersList = await headers();
		const origin = headersList.get("origin");

		const { lineItems } = await req.json();
		// Create Checkout Sessions from body params this is how you checkout the things :)
		const shippingRate = { name: "hello", amount: 1101 };
		const session: Stripe.Checkout.Session =
			await stripe.checkout.sessions.create({
				line_items: lineItems,
				mode: "payment",
				shipping_options: [{
					shipping_rate_data: {
						display_name: shippingRate.name,
						type: "fixed_amount",
						fixed_amount: {
							amount: shippingRate.amount,
							currency: "cad",
						},
					},
				}],
				shipping_address_collection: {
					allowed_countries: ["CA", "US"],
				},
				phone_number_collection: { enabled: true },
				success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
			});
		return NextResponse.json({ url: session.url });
	} catch (err) {
		const error = err as Stripe.errors.StripeError;
		return NextResponse.json(
			{ error: error.message },
			{ status: error.statusCode ?? 500 },
		);
	}
}
