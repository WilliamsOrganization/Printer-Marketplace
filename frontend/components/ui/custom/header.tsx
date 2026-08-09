"use client";

import { Button } from "@/components/ui/button";
import { CartSidebarDrawer } from "./cart-sidebar-drawer";
import Link from "next/link";
import TypeIt from "typeit-react";

export function Header() {
	return (
		<div className="sticky top-0 w-full z-30 border-b bg-background/95 backdrop-blur-sm">
			<div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur-sm">
				{/* Logo */}
				<Link href="/" className="flex items-center">
					<span className="font-serif italic text-xl leading-none">
						<TypeIt
							options={{
								loop: true,
								speed: 50,
								deleteSpeed: 30,
								waitUntilVisible: true,
							}}
							getBeforeInit={(instance) => {
								instance
									.type("PrintMarket")
									.pause(3000)
									.delete()
									.type("Made to Order")
									.pause(3000)
									.delete()
									.type("Custom Prints")
									.pause(3000)
									.delete()
									.type("Ships from Canada")
									.pause(3000)
									.delete();
								return instance;
							}}
						/>
					</span>
				</Link>

				{/* Nav + cart */}
				<div className="flex items-center gap-1">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/orders" className="text-sm text-muted-foreground hover:text-foreground">Orders</Link>
					</Button>
					<Button variant="ghost" size="sm" asChild>
						<Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
							Shop
						</Link>
					</Button>
					<CartSidebarDrawer />
				</div>
			</div>
		</div>
	);
}

export default Header;
