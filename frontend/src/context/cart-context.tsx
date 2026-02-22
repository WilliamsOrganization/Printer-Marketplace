"use client"
import api from "@/lib/api";
import { Cart } from "@/lib/types";
import React, { createContext, useContext, useEffect, useState } from "react";

type CartContextType = {
	cart: Cart | undefined;
	setCart: React.Dispatch<React.SetStateAction<Cart | undefined>>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [cart, setCart] = useState<Cart | undefined>();
	useEffect(() => {
		api
			.get("/cart")
			.then((res) => {
				console.log("successfully fetched cart items in context" + res.data);
				setCart(res.data);
			})
			.catch((err) => {
				console.log("failed to fetch cart with context");
			});
	}, []);
	return (
		<CartContext.Provider value={{ cart, setCart }}>{children}</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context)
		throw new Error("useCart must be used within a CartProfider Componenet");
	return context;
}
