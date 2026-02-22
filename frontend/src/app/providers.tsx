"use client";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../context/cart-context";

// TODO: clean this up I dont think its actually used anywhere
export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			{children}
		</SessionProvider>
	);
}
