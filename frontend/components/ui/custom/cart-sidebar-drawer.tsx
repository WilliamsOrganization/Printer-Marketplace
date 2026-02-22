"use client";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";

import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../card";
import { IconTrendingUp } from "@tabler/icons-react";
import { AddToCartButton } from "./add-to-cart-button";
import { Cart, CartItem, InventoryItem, ItemBadge, User } from "@/lib/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ShoppingBasket } from "lucide-react";
import { DeleteFromCartButton } from "./delete-from-cart-button";
import { useCart } from "@/src/context/cart-context";
import Link from "next/link";

export function CartSidebarDrawer() {
	const { cart, setCart, cartDrawer, setCartDrawer } = useCart();
	return (
		<Drawer direction="right" open={cartDrawer} onOpenChange={setCartDrawer}>
			<DrawerTrigger asChild>
				<Button variant="outline">
					<ShoppingBasket />
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>

					<div className="flex flex-row gap-2 text-3xl items-center">
						<ShoppingBasket className="size-10"/>
						<DrawerTitle >Your Cart</DrawerTitle>
					</div>
					<DrawerDescription className="text-lg text-muted-foreground">Edit your cart items before checkout</DrawerDescription>
				</DrawerHeader>
				<div className="no-scrollbar overflow-y-auto px-4">
					<ul className="flex flex-col gap-2">
						{cart?.items?.map((cartItem) => (
							<ListItem
								key={cartItem.id}
								inventoryItem={cartItem.item}
								cartItem={cartItem}
							>
								{cartItem.item.itemTitle}
							</ListItem>
						))}
					</ul>
				</div>
				<DrawerFooter>

					<Link href="/checkout/">
						<Button>Go to checkout</Button>
					</Link>
					<DrawerClose asChild>
						<Button variant="outline">Close</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

function ListItem({
	key,
	inventoryItem,
	cartItem,
	...props
}: React.ComponentPropsWithoutRef<"li"> & {
	inventoryItem: InventoryItem;
	cartItem: CartItem;
}) {
	return (
		<li {...props}>
			<Card key={inventoryItem.id} className="group overflow-hidden p-0">
				<CardFooter className="flex flex-col items-start gap-2 p-4">
					<div className="flex flex-row justify-between min-w-full">
						<p className="font-bold truncate">{inventoryItem.itemTitle}</p>
						<p className="font-bold">
							${cartItem.quantity * Number(inventoryItem.itemCost.toFixed(2))}
						</p>
					</div>

					<p className="text-muted-foreground line-clamp-2">
						{inventoryItem.itemDescription}
					</p>
					<DeleteFromCartButton cartItem={cartItem} />
				</CardFooter>
			</Card>
		</li>
	);
}
export default CartSidebarDrawer;
