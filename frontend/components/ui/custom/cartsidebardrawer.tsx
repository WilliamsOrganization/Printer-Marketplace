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
import { AddToCartButton } from "./cart-submit-button";
import { CartItem, InventoryItem, ItemBadge, User } from "@/lib/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ShoppingBasket } from "lucide-react";

export function CartSidebarDrawer() {
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const user: User | null = null;
	useEffect(() => {
		if (user) {
			api
				.get(`/cart/${user.id}`)
				.then((res) => {
					console.log("successfully fetched Cart items");
					setCartItems(res.data);
				})
				.catch((err) => {
					console.log("Error fetching cart Items: " + err.message);
				});
		}
	}, []);

	return (
		<Drawer direction="right">
			<DrawerTrigger asChild>
				<Button variant="outline">
					<ShoppingBasket />
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Move Goal</DrawerTitle>
					<DrawerDescription>Set your daily activity goal.</DrawerDescription>
				</DrawerHeader>
				<div className="no-scrollbar overflow-y-auto px-4">
					<ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
						{cartItems.map((cartItem) => (
							<ListItem
								inventoryItem={cartItem.inventoryItem}
								cartItem={cartItem}
							>
								{cartItem.inventoryItem.itemTitle}
							</ListItem>
						))}
					</ul>
				</div>
				<DrawerFooter>
					<Button>Submit</Button>
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

function ListItem({
	inventoryItem,
	cartItem,
	...props
}: React.ComponentPropsWithoutRef<"li"> & {
	inventoryItem: InventoryItem;
	cartItem: CartItem;
}) {
	return (
		<li {...props}>
			<Card key={inventoryItem.id} className="group overflow-hidden">
				<CardContent className="p-0">
					<div className="relative aspect-square bg-muted">
						{inventoryItem.badge && (
							<Badge
								className="absolute top-2 left-2 z-10"
								variant={
									inventoryItem.badge === ItemBadge.SALE
										? "destructive"
										: "secondary"
								}
							>
								{inventoryItem.badge}
							</Badge>
						)}
						<Image
							src={inventoryItem.imageUrl?.[0] || "/globe.svg"}
							alt={inventoryItem.itemTitle}
							fill
							className="object-contain p-8 group-hover:scale-105 transition-transform"
						/>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col items-start gap-2 p-4">
					<div className="flex flex-row justify-between min-w-full">
						<p className="font-bold">{inventoryItem.itemTitle}</p>
						<p className="font-bold">${inventoryItem.itemCost.toFixed(2)}</p>
					</div>

					<p className="text-muted-foreground">
						{inventoryItem.itemDescription}
					</p>
					{/* TODO: remember to implement the quantity */}
					<AddToCartButton itemId={inventoryItem.id} quantity={1} />
				</CardFooter>
			</Card>
		</li>
	);
}
export default CartSidebarDrawer;
