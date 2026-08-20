"use client";
import { SessionProvider } from "next-auth/react";
import { TanstackProvider } from "../context/tanstack-provider";
import { CartProvider } from "../context/cart-context";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<TanstackProvider>
				<CartProvider>
					{children}
				</CartProvider>
			</TanstackProvider>
		</SessionProvider>
	);
}
