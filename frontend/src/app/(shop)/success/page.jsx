import Link from "next/link";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, PackageCheck } from "lucide-react";

export default async function Success({ searchParams }) {
	const { session_id } = await searchParams;

	if (!session_id)
		throw new Error("Please provide a valid session_id (`cs_test_...`)");

	const session = await stripe.checkout.sessions.retrieve(session_id, {
		expand: ["line_items", "payment_intent"],
	});

	if (session.status === "open") {
		return redirect("/");
	}

	if (session.status === "complete") {
		const lineItems = session.line_items?.data ?? [];
		const customerEmail = session.customer_details?.email;

		return (
			<div className="flex flex-col">
				<section className="min-h-[60vh] flex items-center justify-center px-6 py-20">
					<div className="flex flex-col items-center text-center gap-8 w-full max-w-md">
						<div className="size-16 rounded-full bg-muted flex items-center justify-center">
							<PackageCheck className="size-7 text-muted-foreground" />
						</div>

						<div className="flex flex-col gap-3">
							<p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
								Order confirmed
							</p>
							<h1 className="text-4xl font-serif leading-snug">
								Thank you for <span className="italic">your order.</span>
							</h1>
							<p className="text-muted-foreground leading-relaxed">
								A confirmation will be sent to{" "}
								<span className="text-foreground font-medium">
									{customerEmail}
								</span>
								. We'll begin printing shortly.
							</p>
						</div>

						{lineItems.length > 0 && (
					// TODO: This component needs to access the Image url that we configured rather than a generic count
							<>
								<Separator />
								<div className="w-full flex flex-col gap-3">
									<p className="text-xs tracking-[0.2em] uppercase text-muted-foreground text-left">
										Your items
									</p>
									<ul className="flex flex-col gap-3">
										{lineItems.map((item) => (
											<li
												key={item.id}
												className="flex items-center gap-3 rounded-xl border bg-card p-3"
											>
												{/* Quantity badge */}
												<div className="size-16 rounded-lg bg-muted shrink-0 flex items-center justify-center">
													<span className="text-2xl font-serif text-muted-foreground">
														×{item.quantity}
													</span>
												</div>

												{/* Info */}
												<div className="flex flex-col flex-1 min-w-0 gap-1">
													<p className="font-serif leading-snug line-clamp-1 text-sm text-left">
														{item.description}
													</p>
													<p className="text-xs text-muted-foreground text-left">
														${(item.price.unit_amount / 100).toFixed(2)} each
													</p>
													<div className="flex items-center justify-between mt-auto pt-1">
														<p className="text-xs text-muted-foreground">
															Qty {item.quantity}
														</p>
														<p className="text-sm font-semibold">
															${(item.amount_total / 100).toFixed(2)}
														</p>
													</div>
												</div>
											</li>
										))}
									</ul>

									<div className="flex justify-between font-semibold text-sm pt-1 border-t">
										<span>Total</span>
										<span>
											${(session.amount_total / 100).toFixed(2)}{" "}
											<span className="text-xs font-normal text-muted-foreground uppercase">
												{session.currency}
											</span>
										</span>
									</div>
								</div>
							</>
						)}

						<Separator className="w-16" />

						<div className="flex flex-col sm:flex-row items-center gap-4">
							<Button asChild>
								<Link href="/">
									Continue Shopping
									<ArrowRight className="ml-2 size-4" />
								</Link>
							</Button>
							<Button variant="outline" asChild>
								<Link href="/">Back to Home</Link>
							</Button>
						</div>
					</div>
				</section>
			</div>
		);
	}
}
