import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '../../../lib/stripe'

export async function POST(): Promise<NextResponse> {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')

    // Create Checkout Sessions from body params.
    const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, price_1234) of the product you want to sell
		// TODO: configure this price_id for the created inventoryItems
          price: 'price_1T3kNp1CSPVN1tCZpDIIiCz7',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    });
    return NextResponse.redirect(session.url!, 303)
  } catch (err) {
    const error = err as Stripe.errors.StripeError
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode ?? 500 }
    )
  }
}
