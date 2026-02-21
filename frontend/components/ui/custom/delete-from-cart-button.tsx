"use client";

import api from "@/lib/api";
import { Button } from "../button";
import { CartItem } from "@/lib/types";

export function DeleteFromCartButton({
	itemId,
}: {
	itemId: number;
}) {
	const removeCartItem = function(cartId: number) {
		api
			.delete(`/cartitem/${cartId}`)
			.then((res) => {
				console.log("Successfully Deleted Cart Item" + res.data);
			})
			.catch((err) => {
				console.log("Error Deleting Cart Item " + err.message);
				console.log("trying to delete ID: " + cartId);
			});
	};
	return (
		<Button size="sm" className="w-full mt-2" onClick={() => removeCartItem(itemId)}>
			Delete From Cart
		</Button>
	);
}
