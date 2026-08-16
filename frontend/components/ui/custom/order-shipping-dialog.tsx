"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Shipping, ShippingStatus } from "@/lib/types";

const SHIPPING_STATUS_VARIANT: Record<ShippingStatus, "default" | "secondary" | "destructive" | "outline"> = {
	[ShippingStatus.PENDING]: "outline",
	[ShippingStatus.PURCHASED]: "secondary",
	[ShippingStatus.IN_TRANSIT]: "default",
	[ShippingStatus.DELIVERED]: "secondary",
};

function formatCurrency(cents: number) {
	return `$${(cents / 100).toFixed(2)}`;
}

export function OrderShippingDialog({
	shipping,
	estimateCost,
}: {
	shipping: Shipping | null;
	estimateCost: number;
}) {
	return (
		<Dialog>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<Button
							variant="ghost"
							className="text-foreground h-full w-full cursor-pointer justify-center rounded-none font-normal"
						>
							{shipping?.status ?? "—"}
						</Button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>View shipping details</TooltipContent>
			</Tooltip>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Shipping</DialogTitle>
					<DialogDescription>
						Shipping and tracking details for this order.
					</DialogDescription>
				</DialogHeader>
				{!shipping ? (
					<p className="text-muted-foreground text-sm">
						No shipping information for this order yet.
					</p>
				) : (
					<div className="flex flex-col gap-4 text-sm">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Status</span>
							<Badge variant={SHIPPING_STATUS_VARIANT[shipping.status]}>{shipping.status}</Badge>
						</div>

						<Separator />

						<div className="flex flex-col gap-1">
							<span className="text-muted-foreground">From</span>
							<span>
								{shipping.addressFrom.street1}
								{shipping.addressFrom.street2 ? ` ${shipping.addressFrom.street2}` : ""}
							</span>
							<span className="text-muted-foreground">
								{shipping.addressFrom.city}, {shipping.addressFrom.state} {shipping.addressFrom.zip}
							</span>
						</div>

						<div className="flex flex-col gap-1">
							<span className="text-muted-foreground">To</span>
							<span>
								{shipping.addressTo.street1}
								{shipping.addressTo.street2 ? ` ${shipping.addressTo.street2}` : ""}
							</span>
							<span className="text-muted-foreground">
								{shipping.addressTo.city}, {shipping.addressTo.state} {shipping.addressTo.zip}
							</span>
						</div>

						{shipping.currentLocation && (
							<div className="flex flex-col gap-1">
								<span className="text-muted-foreground">Current location</span>
								<span>
									{shipping.currentLocation.city}, {shipping.currentLocation.state}
								</span>
							</div>
						)}

						<Separator />

						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Tracking</span>
							{shipping.trackingUrl ? (
								<a
									href={shipping.trackingUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary underline underline-offset-4"
								>
									{shipping.trackingNumber ?? "Track"}
								</a>
							) : (
								<span className="text-muted-foreground">Not yet shipped</span>
							)}
						</div>

						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Label</span>
							{shipping.labelPdfUrl ? (
								<a
									href={shipping.labelPdfUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary underline underline-offset-4"
								>
									View PDF
								</a>
							) : (
								<span className="text-muted-foreground">Not purchased yet</span>
							)}
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Quoted cost</span>
							<span>{formatCurrency(estimateCost)}</span>
						</div>
						{shipping.actualShippingCost != null && (
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Actual cost</span>
								<span>{formatCurrency(shipping.actualShippingCost)}</span>
							</div>
						)}
					</div>
				)}
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default OrderShippingDialog;
