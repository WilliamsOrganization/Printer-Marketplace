import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import apiServer from "@/lib/api-server";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, PackageCheck } from "lucide-react";
import { OrderConfetti } from "@/components/ui/custom/order-confetti";
import { ShipmentTrackingMap } from "@/components/ui/custom/shipment-tracking-map";

export default async function Success({ searchParams }) {
	const { session_id } = await searchParams;

	if (!session_id)
		throw new Error("Please provide a valid session_id (`cs_test_...`)");

	const { order, session } = await apiServer
		.get(`/orders/${session_id}`)
		.then((res) => res.data)
		.catch((err) => {
			if(err?.response?.status === 404) {
			redirect(`/login?callbackUrl=${encodeURIComponent(`/success?session_id=${session_id}`)}`);
			}
			redirect('/');
		});

	if (session.status === "open") {
		return redirect("/");
	}

	if (session.status === "complete") {
		const items = order?.items ?? [];
		const customerEmail = session.customerEmail;

		return (
			<div className="flex flex-col">
				<OrderConfetti />
				<section className="min-h-[60vh] flex items-center justify-center px-6 py-20">
					<div className="flex flex-col items-center text-center gap-8 w-full max-w-3xl">
						<div className="size-16 rounded-full bg-muted flex items-center justify-center">
							<PackageCheck className="size-7 text-muted-foreground" />
						</div>

						<div className="flex flex-col gap-3 max-w-md">
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

						{(items.length > 0 || order?.shipping) && (
							<>
								<Separator />
								<div className="w-full flex flex-col md:flex-row gap-8">
									{items.length > 0 && (
										<div className="flex-1 flex flex-col gap-3">
											<p className="text-xs tracking-[0.2em] uppercase text-muted-foreground text-left">
												Your items
											</p>
											<ul className="flex flex-col gap-3">
												{items.map((orderItem) => {
													const imageSrc =
														orderItem.item?.imageUrls?.[0] ??
														`/stock-${(orderItem.item?.id % 18) + 1}.jpg`;
													return (
														<li
															key={orderItem.id}
															className="flex items-center gap-3 rounded-xl border bg-card p-3"
														>
															{/* Thumbnail */}
															<div className="relative size-16 rounded-lg overflow-hidden shrink-0 bg-muted">
																<Image
																	src={imageSrc}
																	alt={orderItem.itemTitle}
																	fill
																	className="object-cover"
																/>
															</div>

															{/* Info */}
															<div className="flex flex-col flex-1 min-w-0 gap-1">
																<p className="font-serif leading-snug line-clamp-1 text-sm text-left">
																	{orderItem.itemTitle}
																</p>
																<p className="text-xs text-muted-foreground text-left">
																	${(orderItem.unitPrice / 100).toFixed(2)} each
																</p>
																<div className="flex items-center justify-between mt-auto pt-1">
																	<p className="text-xs text-muted-foreground">
																		Qty {orderItem.quantity}
																	</p>
																	<p className="text-sm font-semibold">
																		$
																		{(
																			(orderItem.unitPrice * orderItem.quantity) /
																			100
																		).toFixed(2)}
																	</p>
																</div>
															</div>
														</li>
													);
												})}
											</ul>

											<div className="flex justify-between font-semibold text-sm pt-1 border-t">
												<span>Total</span>
												<span>
													${(session.amountTotal / 100).toFixed(2)}{" "}
													<span className="text-xs font-normal text-muted-foreground uppercase">
														{session.currency}
													</span>
												</span>
											</div>
										</div>
									)}

									{order?.shipping && (
										<div className="flex-1 flex flex-col gap-3">
											<p className="text-xs tracking-[0.2em] uppercase text-muted-foreground text-left">
												Shipping to
											</p>
											<p className="text-sm text-left">
												{order.shipping.addressTo.street1}
												{order.shipping.addressTo.street2 ? ` ${order.shipping.addressTo.street2}` : ""}
												<br />
												{order.shipping.addressTo.city}, {order.shipping.addressTo.state}{" "}
												{order.shipping.addressTo.zip}
											</p>
											{order.shipping.currentLocation && (
												<p className="text-xs text-muted-foreground text-left">
													Currently near {order.shipping.currentLocation.city}
													{order.shipping.currentLocation.state
														? `, ${order.shipping.currentLocation.state}`
														: ""}
												</p>
											)}
											<ShipmentTrackingMap shipping={order.shipping} />
										</div>
									)}
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
