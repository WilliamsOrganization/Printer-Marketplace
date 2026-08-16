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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { OrderItem } from "@/lib/types";

export function OrderItemsDialog({ items }: { items: OrderItem[] }) {
	const itemCount = items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

	return (
		<Dialog>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<Button
							variant="ghost"
							className="text-foreground h-full w-full cursor-pointer justify-center rounded-none font-normal"
						>
							{itemCount} item{itemCount === 1 ? "" : "s"}
						</Button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>View order items</TooltipContent>
			</Tooltip>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Order Items</DialogTitle>
					<DialogDescription>
						Line items included in this order.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-3">
					{items?.length ? (
						items.map((orderItem) => (
							<div
								key={orderItem.id}
								className="flex items-center justify-between rounded-lg border p-3"
							>
								<div className="flex flex-col">
									<span className="text-sm font-medium">{orderItem.itemTitle}</span>
									<span className="text-muted-foreground text-xs">
										${(orderItem.unitPrice / 100).toFixed(2)} each &middot; Qty {orderItem.quantity}
									</span>
								</div>
								<span className="text-sm font-semibold">
									${((orderItem.unitPrice * orderItem.quantity) / 100).toFixed(2)}
								</span>
							</div>
						))
					) : (
						<p className="text-muted-foreground text-sm">No items on this order.</p>
					)}
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default OrderItemsDialog;
