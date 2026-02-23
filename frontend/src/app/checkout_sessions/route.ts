import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "../../../lib/stripe";

export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		const headersList = await headers();
		const origin = headersList.get("origin");

		const { lineItems } = await req.json();
		// Create Checkout Sessions from body params.
		const session: Stripe.Checkout.Session =
			await stripe.checkout.sessions.create({
				line_items: lineItems,
				mode: "payment",
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
