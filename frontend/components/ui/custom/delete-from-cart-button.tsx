import api from "@/lib/api";
import { Button } from "../button";
import { Cart, CartItem } from "@/lib/types";
import { toast } from "sonner";
import React from "react";
import { useCart } from "@/src/context/cart-context";

export function DeleteFromCartButton({
	itemId,
}: {
	itemId: number;
}) {
	const {cart, setCart}= useCart();
	const removeCartItem = function(cartId: number) {
		api
			.delete(`/cartitem/${cartId}`)
			.then((res) => {
				toast.success("Successfuly deleted cart item");
				setCart((previous)=>{
					const updatedItems = previous!.items.filter((item)=> item.id !== cartId)
					const updatedCart = { ...previous!, items: updatedItems}
					return updatedCart;
				})
			})
			.catch((err) => {
				toast.error("Error deleting cart item")
				console.log("Error: "+ err.message)
			});
	};
	return (
		<Button size="sm" className="w-full mt-2" onClick={() => removeCartItem(itemId)}>
			Delete From Cart
		</Button>
	);
}
