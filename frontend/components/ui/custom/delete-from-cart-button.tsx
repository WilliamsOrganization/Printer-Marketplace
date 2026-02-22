import api from "@/lib/api";
import { Button } from "../button";
import { Cart, CartItem } from "@/lib/types";
import { toast } from "sonner";
import React, { useState } from "react";
import { useCart } from "@/src/context/cart-context";
import { Input } from "../input";
import { NumericFormat } from "react-number-format";

export function DeleteFromCartButton({ cartItem }: { cartItem: CartItem }) {
	const { cart, setCart } = useCart();

	const updateQuantityServer = (cartItem: CartItem, quantity: number) => {
		//update locally on blur
		//
		if (quantity < 0) {
			toast.error("Cannot be a negative number");
		}

		setCart((previous) => {
			const updatedItems = previous!.items.map((item) =>
				item.id === cartItem.id ? { ...item, quantity: quantity } : item,
			);
			return { ...previous!, items: updatedItems };
		});
		//update on server
		api
			.put(`/cartitem/quantity/${cartItem.id}`, quantity)
			.then((res) => {
				toast.success("Successfully updated Cart quantity");
			})
			.catch(() => {
				toast.error("failed to update cart quantity");
			});
	};

	const removeCartItem = function(cartId: number) {
		api
			.delete(`/cartitem/${cartId}`)
			.then((res) => {
				toast.success("Successfuly deleted cart item");
				setCart((previous) => {
					const updatedItems = previous!.items.filter(
						(item) => item.id !== cartId,
					);
					const updatedCart = { ...previous!, items: updatedItems };
					return updatedCart;
				});
			})
			.catch((err) => {
				toast.error("Error deleting cart item");
				console.log("Error: " + err.message);
			});
	};
	return (
		<>
			<Button
				size="sm"
				className="w-full mt-2"
				onClick={() => removeCartItem(cartItem.id)}
			>
				Delete From Cart
			</Button>
			{/* TODO: shitty solution but better */}
			<NumericFormat
				defaultValue={cartItem.quantity}
				max={20}
				min={1}
				allowNegative={false}
				decimalScale={0}
				onBlur={(e) => updateQuantityServer(cartItem, Number( e.target.value ))}
				type={ "number" as any }
				customInput={Input}
			></NumericFormat>
		</>
	);
}
