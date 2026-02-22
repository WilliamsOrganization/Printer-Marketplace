import { redirect } from "next/navigation";

import { stripe } from "../../../lib/stripe";

export default async function Success({ searchParams }) {
	const { session_id } = await searchParams;

	if (!session_id)
		throw new Error("Please provide a valid session_id (`cs_test_...`)");

	const {
		status,
		customer_details: { email: customerEmail },
	} = await stripe.checkout.sessions.retrieve(session_id, {
		expand: ["line_items", "payment_intent"],
	});

	if (status === "open") {
		return redirect("/");
	}

	// TODO: Make the confirmation success page pretty
	if (status === "complete") {
		return (
			<div className="mx-auto max-w-7xl h-[70vh] px-6 py-8">
				<section
					id="success"
					className="min-w-full min-h-full flex gap-8 flex-col justify-center items-center "
				>
					<div>
						We appreciate your business! A confirmation email will be sent to{" "}
						{customerEmail}. If you have any questions, please email{" "}
					</div>
					<a href="mailto:orders@example.com">orders@example.com</a>.
				</section>
			</div>
		);
	}
}
