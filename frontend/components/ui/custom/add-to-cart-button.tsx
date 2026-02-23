"use client";

import api from "@/lib/api";
import { Button } from "../button";
import { toast } from "sonner";
import { useCart } from "@/src/context/cart-context";

export function AddToCartButton({
	itemId,
	quantity,
}: {
	itemId: number;
	quantity: number;
}) {
	const { cart, setCart, cartDrawer, setCartDrawer } = useCart();
	const addCartItem = function(id: number, quantity: number) {
		api
			.post("/cartitem", {
				itemId: id,
				quantity: quantity,
			})
			.then((res) => {
				toast.success("Item successfuly added to cart");
				setCart((previous) => {

					const updatedItems = (previous?.items ?? []).concat(res.data);                              
					const updatedCart = { ...previous!, items: updatedItems };
					return updatedCart;
				});
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
	return (
		// TODO: make this dependend on cart item state. if it exists in the cart -> see in cart
		<Button
			size="sm"
			className="w-full mt-2"
			onClick={() => addCartItem(itemId, quantity)}
		>
			Add to cart
		</Button>
	);
}
