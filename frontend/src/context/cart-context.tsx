"use client"
import api from "@/lib/api";
import { useAppQuery } from "@/lib/use-app-query";
import { Cart } from "@/lib/types";
import React, { createContext, useContext, useState } from "react";

type CartContextType = {
	cart: Cart | undefined;
	isLoading: boolean;
	cartDrawer: boolean;
	setCartDrawer: React.Dispatch<React.SetStateAction<boolean>>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [cartDrawer, setCartDrawer] = useState<boolean>(false);

	// Data lives in the query cache now, not local state - mutations
	// (add/remove/update quantity) invalidate ["cart"] instead of calling a
	// setter directly, so this always reflects the server's actual state.
	const { data: cart, isLoading } = useAppQuery<Cart>({
		queryKey: ["cart"],
		queryFn: () => api.get("/cart").then((res) => res.data),
	});

	return (
		<CartContext.Provider value={{ cart, isLoading, cartDrawer, setCartDrawer }}>{children}</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context)
		throw new Error("useCart must be used within a CartProfider Componenet");
	return context;
}
