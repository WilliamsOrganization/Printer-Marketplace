"use client";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
	Minus,
	PackageOpen,
	Plus,
	ShoppingBasket,
	ShoppingCart,
	Trash2,
} from "lucide-react";
import { CartItem } from "@/lib/types";
import { useCart } from "@/src/context/cart-context";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

export function CartSidebarDrawer() {
	const { cart, cartDrawer, setCartDrawer } = useCart();
	const queryClient = useQueryClient();

	const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
	const subtotal =
		cart?.items?.reduce((sum, i) => sum + i.quantity * i.item.itemCost, 0) ?? 0;

	const handleQuantityChange = (id: number, qty: number) => {
		if (qty < 1) return;
		api
			.put(`/cartitem/quantity/${id}`, qty)
			.then(() => queryClient.invalidateQueries({ queryKey: ["cart"] }))
			.catch(() => toast.error("Failed to update quantity"));
	};

	const handleRemove = (id: number) => {
		api
			.delete(`/cartitem/${id}`)
			.then(() => {
				toast.success("Item removed");
				queryClient.invalidateQueries({ queryKey: ["cart"] });
			})
			.catch(() => toast.error("Failed to remove item"));
	};

	return (
		<Drawer direction="right" open={cartDrawer} onOpenChange={setCartDrawer}>
			<DrawerTrigger asChild>
				<Button variant="outline" size="icon" className="relative">
					<ShoppingBasket className="size-5" />
					{itemCount > 0 && (
						<span className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
							{itemCount > 9 ? "9+" : itemCount}
						</span>
					)}
				</Button>
			</DrawerTrigger>

			<DrawerContent>
				{/* Header */}
				<DrawerHeader className="border-b">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<ShoppingBasket className="size-4" />
							<DrawerTitle className="font-serif italic font-normal">
								Your cart
							</DrawerTitle>
						</div>
						{itemCount > 0 && (
							<Badge variant="secondary">
								{itemCount} {itemCount === 1 ? "item" : "items"}
							</Badge>
						)}
					</div>
				</DrawerHeader>

				{/* Items */}
				<div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3">
					{cart?.items?.length ? (
						<ul className="flex flex-col gap-3">
							{cart.items.map((cartItem) => (
								<CartItemCard
									key={cartItem.id}
									cartItem={cartItem}
									onQuantityChange={handleQuantityChange}
									onRemove={handleRemove}
								/>
							))}
						</ul>
					) : (
						<div className="flex flex-col items-center justify-center h-[60vh] gap-3 text-muted-foreground">
							<div className="size-16 rounded-full bg-muted flex items-center justify-center">
								<PackageOpen className="size-7" />
							</div>
							<div className="text-center">
								<p className="font-serif italic text-foreground">
									Nothing here yet.
								</p>
								<p className="text-xs mt-1 tracking-wide">
									Add some items to get started
								</p>
							</div>
						</div>
					)}
				</div>

				{/* Subtotal */}
				{itemCount > 0 && (
					<>
						<Separator />
						<div className="px-4 py-3 space-y-1.5 text-sm">
							<div className="flex justify-between text-muted-foreground">
								<span>Subtotal</span>
								<span>${subtotal.toFixed(2)}</span>
							</div>
							<div className="flex justify-between text-muted-foreground">
								<span>Shipping</span>
								<span className="text-xs italic">Calculated at checkout</span>
							</div>
							<div className="flex justify-between font-semibold text-foreground pt-1 border-t">
								<span>Total</span>
								<span>${subtotal.toFixed(2)}</span>
							</div>
						</div>
					</>
				)}

				{/* Footer */}
				<DrawerFooter>

				<Button
					className="w-full"
					disabled={!cart?.items?.length}
					asChild
				>
					<Link href="/checkout"
							onClick={() => { setCartDrawer(false) }}
						>
						<ShoppingCart className="size-4" />
						Checkout · ${subtotal.toFixed(2)}
					</Link>
				</Button>

					<DrawerClose asChild>
						<Button variant="outline" className="w-full">
							Continue Shopping
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

function CartItemCard({
	cartItem,
	onQuantityChange,
	onRemove,
}: {
	cartItem: CartItem;
	onQuantityChange: (id: number, qty: number) => void;
	onRemove: (id: number) => void;
}) {
	const { item, quantity } = cartItem;
	const imageSrc = item.imageUrls?.[0] ?? `/stock-${(item.id % 18) + 1}.jpg`;

	return (
		<li className="flex items-center gap-3 rounded-xl border bg-card p-3">
			{/* Thumbnail */}
			<div className="relative size-16 rounded-lg overflow-hidden shrink-0 bg-muted">
				<Image
					src={imageSrc}
					alt={item.itemTitle}
					fill
					className="object-cover"
				/>
			</div>

			{/* Info */}
			<div className="flex flex-col flex-1 min-w-0 gap-1">
				<div className="flex items-start justify-between gap-1">
					<p className="font-serif leading-snug line-clamp-1 text-sm">
						{item.itemTitle}
					</p>
					<Button
						size="icon"
						variant="ghost"
						className="size-6 shrink-0 -mt-0.5 text-muted-foreground hover:text-destructive"
						onClick={() => onRemove(cartItem.id)}
					>
						<Trash2 className="size-3.5" />
					</Button>
				</div>

				{/* Quantity + price row */}
				<div className="flex items-center justify-between mt-auto pt-1">
					<div className="flex items-center rounded-md border overflow-hidden">
						<Button
							size="icon"
							variant="ghost"
							className="size-6 rounded-none border-r"
							onClick={() => onQuantityChange(cartItem.id, quantity - 1)}
							disabled={quantity <= 1}
						>
							<Minus className="size-3" />
						</Button>
						<span className="w-7 text-center text-xs font-medium">
							{quantity}
						</span>
						<Button
							size="icon"
							variant="ghost"
							className="size-6 rounded-none border-l"
							onClick={() => onQuantityChange(cartItem.id, quantity + 1)}
							disabled={quantity >= 20}
						>
							<Plus className="size-3" />
						</Button>
					</div>

					<p className="text-sm font-semibold">
						${(quantity * item.itemCost).toFixed(2)}
					</p>
				</div>
			</div>
		</li>
	);
}

export default CartSidebarDrawer;
