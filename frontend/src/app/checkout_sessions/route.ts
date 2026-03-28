import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

/**
 * TODO: Refactor Stripe out of the frontend entirely.
 *
 * Currently Stripe checkout session creation lives here on the Next.js server,
 * while cart, inventory, and shipping logic live on the Spring backend. This split
 * means this route has to reach back to Spring to verify prices, shipping rates,
 * and cart contents before creating a session — duplicating trust boundaries.
 *
 * Target architecture:
 *   Client → Spring backend (POST /checkout) → creates Stripe session with verified
 *   cart line items + shipping rate → returns Stripe checkout URL → client redirects.
 *   Stripe webhook → Spring backend → order fulfillment.
 *
 * Spring already owns the cart, inventory, and Shippo shipping rates. It should also
 * own Stripe session creation so there's a single source of truth for pricing.
 * This route and the frontend Stripe dependency can then be removed entirely.
 *
 * Note: THIS NOTE IS SUS The success page (src/app/(shop)/success/page.jsx) uses the Stripe SDK in a
 * server component to retrieve the completed session via stripe.checkout.sessions.retrieve().
 * This is read-only and works fine as-is after the refactor — it only needs the session_id
 * query param. However, for full consolidation, this could also move to a Spring endpoint
 * (e.g. GET /orders/confirm?session_id=xxx) and the frontend Stripe SDK removed entirely.
 */
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
