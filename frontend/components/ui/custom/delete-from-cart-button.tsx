import api from "@/lib/api";
import { Button } from "../button";
import { CartItem } from "@/lib/types";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "../input";
import { NumericFormat } from "react-number-format";
import { CardTitle } from "../card";

export function DeleteFromCartButton({ cartItem }: { cartItem: CartItem }) {
	const queryClient = useQueryClient();

	const updateQuantityServer = (cartItem: CartItem, quantity: number) => {
		if (quantity < 0) {
			toast.error("Cannot be a negative number");
			return;
		}

		api
			.put(`/cartitem/quantity/${cartItem.id}`, quantity)
			.then(() => {
				toast.success("Successfully updated Cart quantity");
				queryClient.invalidateQueries({ queryKey: ["cart"] });
			})
			.catch(() => {
				toast.error("failed to update cart quantity");
			});
	};

	const removeCartItem = function(cartId: number) {
		api
			.delete(`/cartitem/${cartId}`)
			.then(() => {
				toast.success("Successfuly deleted cart item");
				queryClient.invalidateQueries({ queryKey: ["cart"] });
			})
			.catch((err) => {
				toast.error("Error deleting cart item");
				console.log("Error: " + err.message);
			});
	};
	return (
		<>
			{/* TODO: shitty solution but better */}
			<CardTitle className="text-md font-bold">Quantity</CardTitle>
			<NumericFormat
				defaultValue={cartItem.quantity}
				max={20}
				min={1}
				allowNegative={false}
				decimalScale={0}
				onBlur={(e) => updateQuantityServer(cartItem, Number(e.target.value))}
				type={"number" as any}
				customInput={Input}
			/>
			<Button
				size="sm"
				className="w-full mt-2"
				onClick={() => removeCartItem(cartItem.id)}
			>
				Remove From Cart
			</Button>
		</>
	);
}
