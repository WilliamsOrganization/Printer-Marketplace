"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Orders, OrderItem } from "@/lib/types";

export function ReturnOrderForm({ order, sessionId }: { order: Orders; sessionId: string }) {
	const router = useRouter();
	const [quantities, setQuantities] = useState<Record<number, number>>({});
	const [reason, setReason] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const items = order.items ?? [];

	function setQuantity(item: OrderItem, quantity: number) {
		const clamped = Math.max(0, Math.min(quantity, item.quantity));
		setQuantities((prev) => ({ ...prev, [item.id]: clamped }));
	}

	const selectedItems = items
		.filter((item) => (quantities[item.id] ?? 0) > 0)
		.map((item) => ({ ...item, quantity: quantities[item.id] }));

	const canSubmit = selectedItems.length > 0 && reason.trim().length > 0 && !submitting;

	function handleSubmit() {
		setSubmitting(true);
		api
			.post("/returns", {
				orderId: order.id,
				orderItems: selectedItems,
				reason: reason.trim(),
			})
			.then(() => {
				toast.success("Return request submitted");
				router.push(`/order-status?session_id=${sessionId}`);
			})
			.catch(() => toast.error("Failed to submit return request"))
			.finally(() => setSubmitting(false));
	}

	return (
		<div className="flex flex-col gap-8 w-full">
			<div className="w-full flex flex-col md:flex-row gap-8">
				<div className="flex-1 flex flex-col gap-3">
					<p className="text-xs tracking-[0.2em] uppercase text-muted-foreground text-left">
						Select items to return
					</p>
					<div className="flex flex-col gap-3">
						{items.map((item) => {
							const quantity = quantities[item.id] ?? 0;
							return (
								<div
									key={item.id}
									className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3"
								>
									<div className="flex flex-col min-w-0 gap-1 text-left">
										<p className="text-sm font-medium truncate">{item.itemTitle}</p>
										<p className="text-xs text-muted-foreground">
											${(item.unitPrice / 100).toFixed(2)} each &middot; Ordered {item.quantity}
										</p>
									</div>
									<div className="flex items-center rounded-md border overflow-hidden shrink-0">
										<Button
											size="icon"
											variant="ghost"
											className="size-7 rounded-none border-r"
											onClick={() => setQuantity(item, quantity - 1)}
											disabled={quantity <= 0}
										>
											<Minus className="size-3.5" />
										</Button>
										<span className="w-8 text-center text-sm font-medium">{quantity}</span>
										<Button
											size="icon"
											variant="ghost"
											className="size-7 rounded-none border-l"
											onClick={() => setQuantity(item, quantity + 1)}
											disabled={quantity >= item.quantity}
										>
											<Plus className="size-3.5" />
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<div className="flex-1 flex flex-col gap-3">
					<Label
						htmlFor="reason"
						className="text-xs tracking-[0.2em] uppercase text-muted-foreground text-left"
					>
						Reason for return
					</Label>
					<Textarea
						id="reason"
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						placeholder="Tell us why you're returning these items"
						className="flex-1 min-h-32"
					/>
				</div>
			</div>

			<Separator />

			<div className="flex items-center gap-4">
				<Button onClick={handleSubmit} disabled={!canSubmit} className="flex-1">
					{submitting ? "Submitting..." : "Submit return"}
					<ArrowRight className="ml-2 size-4" />
				</Button>
				<Button variant="outline" onClick={() => router.back()} className="flex-1">
					Cancel
				</Button>
			</div>
		</div>
	);
}

export default ReturnOrderForm;
