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
import { Cart, CartItem, InventoryItem, ItemBadge, User } from "@/lib/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ShoppingBasket } from "lucide-react";
import { DeleteFromCartButton } from "./delete-from-cart-button";

export function CartSidebarDrawer() {
	const [cart, setCartItems] = useState<Cart>();
	useEffect(() => {
		api
			.get("/cart")
			.then((res) => {
				console.log("successfully fetched Cart items");
				setCartItems(res.data);
			})
			.catch((err) => {
				console.log("Error fetching cart Items: " + err.message);
			});
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
			<Card key={inventoryItem.id} className="group overflow-hidden">
				<CardFooter className="flex flex-col items-start gap-2 p-4">
					<div className="flex flex-row justify-between min-w-full">
						<p className="font-bold">{inventoryItem.itemTitle}</p>
						<p className="font-bold">${inventoryItem.itemCost.toFixed(2)}</p>
					</div>

					<p className="text-muted-foreground">
						{inventoryItem.itemDescription}
					</p>
					{/* TODO: Change this to a remove from cart button  */}
					<DeleteFromCartButton itemId={cartItem.id}/>
				</CardFooter>
			</Card>
		</li>
	);
}
export default CartSidebarDrawer;
