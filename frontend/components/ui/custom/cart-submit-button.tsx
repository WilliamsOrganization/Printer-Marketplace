"use client";

import api from "@/lib/api";
import { Button } from "../button";

export function AddToCartButton({
	itemId,
	quantity,
}: {
	itemId: number;
	quantity: number;
}) {
	const addCartItem = function(id: number, quantity: number) {
		api
			.post("/cartitem", {
				itemId: id,
				quantity: quantity,
			})
			.then((res) => {
				console.log("Success: " + res.data);
			})
			.catch((err) => {
				console.log("Error: " + err.message);
			});
	};
	return (
		<Button size="sm" className="w-full mt-2" onClick={() => addCartItem(itemId, quantity)}>
			Add to cart
		</Button>
	);
}
