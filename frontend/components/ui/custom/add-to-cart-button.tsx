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
	const { cart, setCart } = useCart();
	const addCartItem = function(id: number, quantity: number) {
		api
			.post("/cartitem", {
				itemId: id,
				quantity: quantity,
			})
			.then((res) => {
				toast.success("Item successfuly added to cart");
				console.log("res.data: " + JSON.stringify(res.data));

				console.log("previous cart:", cart);
				console.log("res.data:", res.data);

				setCart((previous) => {
					const updatedItems = previous!.items.concat(res.data);
					const updatedCart = { ...previous!, items: updatedItems };
					return updatedCart;
				});
			})
			.catch((err) => {
				console.log("Error: " + err.message);
				toast.error("Failed to add item to cart");
			});
	};
	return (
		<Button
			size="sm"
			className="w-full mt-2"
			onClick={() => addCartItem(itemId, quantity)}
		>
			Add to cart
		</Button>
	);
}
