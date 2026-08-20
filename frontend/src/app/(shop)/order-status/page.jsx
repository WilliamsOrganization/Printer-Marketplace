import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import apiServer from "@/lib/api-server";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, PackageCheck } from "lucide-react";
import { OrderConfetti } from "@/components/ui/custom/order-confetti";
import { ShipmentTrackingMap } from "@/components/ui/custom/shipment-tracking-map";
import { getShipmentStatusDisplay } from "@/lib/shipment-status";

export default async function OrderStatus({ searchParams }) {
	const { session_id } = await searchParams;

	if (!session_id)
		throw new Error("Please provide a valid session_id (`cs_test_...`)");

	const { order, session } = await apiServer
		.get(`/orders/${session_id}`)
		.then((res) => res.data)
		.catch((err) => {
			if(err?.response?.status === 404) {
			redirect(`/login?callbackUrl=${encodeURIComponent(`/order-status?session_id=${session_id}`)}`);
			}
			redirect('/');
		});

	if (session.status === "open") {
		return redirect("/");
	}

	if (session.status === "complete") {
		const items = order?.items ?? [];
		const shipping = order?.shipping;
		const customerEmail = session.customerEmail;

		const statusDisplay = shipping
			? getShipmentStatusDisplay(shipping, customerEmail)
			: {
					eyebrow: "Order confirmed",
					heading: "Thank you for your order.",
					description: `A confirmation will be sent to ${customerEmail}.`,
					addressLabel: null,
					address: null,
					markers: [],
				};

		return (
			<div className="flex flex-col">
				{(!shipping || shipping.status === "PENDING") && <OrderConfetti />}
				<section className="min-h-[60vh] flex items-center justify-center px-6 py-20">
					<div className="flex flex-col items-center text-center gap-8 w-full max-w-3xl">
						<div className="size-16 rounded-full bg-muted flex items-center justify-center">
							<PackageCheck className="size-7 text-muted-foreground" />
						</div>

						<div className="flex flex-col gap-3 max-w-md">
							<p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
								{statusDisplay.eyebrow}
							</p>
							<h1 className="text-4xl font-serif leading-snug">
								{statusDisplay.heading}
							</h1>
							<p className="text-muted-foreground leading-relaxed">
								{statusDisplay.description}
							</p>
						</div>

						{(items.length > 0 || shipping) && (
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

									{shipping && (
										<div className="flex-1 flex flex-col gap-3">
											<p className="text-xs tracking-[0.2em] uppercase text-muted-foreground text-left">
												{statusDisplay.addressLabel}
											</p>
											<p className="text-sm text-left">
												{statusDisplay.address.street1}
												{statusDisplay.address.street2 ? ` ${statusDisplay.address.street2}` : ""}
												<br />
												{statusDisplay.address.city}, {statusDisplay.address.state}{" "}
												{statusDisplay.address.zip}
											</p>
											{shipping.trackingNumber && (
												<p className="text-xs text-muted-foreground text-left">
													Tracking:{" "}
													{shipping.trackingUrl ? (
														<a
															href={shipping.trackingUrl}
															target="_blank"
															rel="noreferrer"
															className="underline underline-offset-2"
														>
															{shipping.trackingNumber}
														</a>
													) : (
														shipping.trackingNumber
													)}
												</p>
											)}
											<ShipmentTrackingMap markers={statusDisplay.markers} />
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
								<Link href="/orders">Return to orders</Link>
							</Button>
							{shipping?.status === "DELIVERED" && (
								<Button variant="outline" asChild>
									<Link href={`/order-status/return?session_id=${session_id}`}>
										Start a return
									</Link>
								</Button>
							)}
						</div>
					</div>
				</section>
			</div>
		);
	}
}
