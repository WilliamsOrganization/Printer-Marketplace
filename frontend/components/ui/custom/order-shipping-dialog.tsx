"use client";

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
import { Shipping } from "@/lib/types";

export function OrderShippingDialog({ shipping }: { shipping: Shipping | null }) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="link" className="text-foreground w-fit px-0 text-left">
					{shipping?.status ?? "—"}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Shipping</DialogTitle>
					<DialogDescription>
						Shipping and tracking details for this order.
					</DialogDescription>
				</DialogHeader>
				{/* TODO: implement once label generation lands (see
					StripeCatalogService.handleSuccessCheckoutEvent) - populate with
					shipping.trackingNumber/trackingUrl/labelPdfUrl/addressTo, etc. */}
				<p className="text-muted-foreground text-sm">
					Shipping details are not available yet - to be implemented.
				</p>
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
