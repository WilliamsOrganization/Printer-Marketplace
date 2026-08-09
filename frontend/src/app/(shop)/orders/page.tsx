import Link from "next/link";
import Image from "next/image";
import apiServer from "@/lib/api-server";

// This page's data depends on the caller's session (via apiServer's
// Authorization header). Without forcing dynamic rendering, Next.js can
// treat this route as static (no top-level dynamic API usage) and keep
// serving one cached render to every visitor/refresh regardless of session.
export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, PackageOpen, Receipt } from "lucide-react";
import type { OrderResponse, OrderItem } from "@/lib/types";
import { OrderStatus } from "@/lib/types";

const STATUS_VARIANT: Record<
	OrderStatus,
	"default" | "secondary" | "destructive"
> = {
	[OrderStatus.PENDING]: "secondary",
	[OrderStatus.COMPLETED]: "default",
	[OrderStatus.CANCELLED]: "destructive",
};

export default async function OrdersPage() {
	const orders = await apiServer
		.get<OrderResponse[]>("/orders/")
		.then((res) => res.data);

	if (!orders || orders.length === 0) {
		return (
			<div className="flex flex-col">
				<section className="min-h-[60vh] flex items-center justify-center px-6 py-20">
					<div className="flex flex-col items-center text-center gap-3 w-full max-w-md text-muted-foreground">
						<div className="size-16 rounded-full bg-muted flex items-center justify-center">
							<PackageOpen className="size-7" />
						</div>
						<div className="text-center">
							<p className="font-serif italic text-foreground">
								No orders yet.
							</p>
							<p className="text-xs mt-1 tracking-wide">
								Orders you place will show up here.
							</p>
						</div>
						<Button asChild className="mt-4">
							<Link href="/">
								Continue Shopping
								<ArrowRight className="ml-2 size-4" />
							</Link>
						</Button>
					</div>
				</section>
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			<section className="px-6 py-20 md:px-10">
				<div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
					<div className="flex flex-col gap-3 text-center">
						<p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
							Your account
						</p>
						<h1 className="text-4xl font-serif leading-snug">Your orders</h1>
					</div>

					<div className="flex flex-col gap-4">
						{orders.map(({ order }) => {
							const items = order?.items ?? [];
							const previewItems = items.slice(0, 4);
							const extraCount = items.length - previewItems.length;

							return (
								<Card key={order.id}>
									<CardHeader className="flex flex-row items-start justify-between gap-4">
										<div className="flex flex-col gap-1">
											<CardTitle className="text-base font-serif">
												Order #{order.id}
											</CardTitle>
											<p className="text-xs text-muted-foreground">
												{order.date
													? new Date(order.date).toLocaleDateString(
															undefined,
															{
																year: "numeric",
																month: "long",
																day: "numeric",
															},
														)
													: null}
											</p>
										</div>
										<Badge variant={STATUS_VARIANT[order.status] ?? "outline"}>
											{order.status}
										</Badge>
									</CardHeader>

									<CardContent>
										<Separator className="mb-4" />
										<ul className="flex flex-col gap-3">
											{previewItems.map((orderItem: OrderItem) => {
												const imageSrc =
													orderItem.item?.imageUrls?.[0] ??
													`/stock-${(orderItem.item?.id % 18) + 1}.jpg`;
												return (
													<li
														key={orderItem.id}
														className="flex items-center gap-3"
													>
														<div className="relative size-12 rounded-lg overflow-hidden shrink-0 bg-muted">
															<Image
																src={imageSrc}
																alt={orderItem.itemTitle}
																fill
																className="object-cover"
															/>
														</div>
														<div className="flex flex-col flex-1 min-w-0">
															<p className="text-sm leading-snug line-clamp-1">
																{orderItem.itemTitle}
															</p>
															<p className="text-xs text-muted-foreground">
																Qty {orderItem.quantity}
															</p>
														</div>
														<p className="text-sm font-medium">
															$
															{(
																(orderItem.unitPrice * orderItem.quantity) /
																100
															).toFixed(2)}
														</p>
													</li>
												);
											})}
										</ul>
										{extraCount > 0 && (
											<p className="text-xs text-muted-foreground mt-2">
												+{extraCount} more item{extraCount === 1 ? "" : "s"}
											</p>
										)}
									</CardContent>

									<CardFooter className="flex items-center justify-between">
										<p className="text-sm font-semibold">
											${((order.total ?? 0) / 100).toFixed(2)}{" "}
											<span className="text-xs font-normal text-muted-foreground uppercase">
												{order.currency}
											</span>
										</p>
										<Button variant="outline" size="sm" asChild>
											<Link
												href={`/success?session_id=${order.stripeSessionId}`}
											>
												View details
												<Receipt className="ml-2 size-4" />
											</Link>
										</Button>
									</CardFooter>
								</Card>
							);
						})}
					</div>
				</div>
			</section>
		</div>
	);
}
