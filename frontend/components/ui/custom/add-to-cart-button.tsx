"use client";

import api from "@/lib/api";
import { Button } from "../button";
import { toast } from "sonner";
import { useCart } from "@/src/context/cart-context";
import { InventoryItem } from "@/lib/types";
import { ShoppingCart, ShoppingBasket } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";

export function AddToCartButton({
	item,
	quantity,
}: {
	item: InventoryItem;
	quantity: number;
}) {
	const { cart, setCartDrawer } = useCart();
	const { status } = useSession();
	const queryClient = useQueryClient();
	const addCartItem = function(id: number, quantity: number) {
		api
			.post("/cartitem", {
				itemId: id,
				quantity: quantity,
			})
			.then((res) => {
				toast.success("Item successfuly added to cart");
				if (res.data.sessionToken && status === "unauthenticated") {
					signIn("guest", { sessionToken: res.data.sessionToken, redirect: false });
				}
				queryClient.invalidateQueries({ queryKey: ["cart"] });
				setCartDrawer(true);
			})
			.catch((err) => {
				console.log("Error: " + err.message);
				if (err.response?.status === 409) {
					toast.error("Item exists in cart already");
				} else {
					toast.error("Failed to add item to cart");
				}
			});
	};

	const inCart = cart?.items?.some((i) => i.item.id === item.id);

	return (
		<Button
			size="sm"
			variant={inCart ? "secondary" : "default"}
			className="w-full"
			onClick={() => {
				if (inCart) {
					setCartDrawer(true);
				} else {
					addCartItem(item.id, quantity);
				}
			}}
		>
			{inCart ? (
				<><ShoppingBasket className="size-4" /> See in cart</>
			) : (
				<><ShoppingCart className="size-4" /> Add to cart</>
			)}
		</Button>
	);
}
