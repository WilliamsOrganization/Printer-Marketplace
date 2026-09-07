"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CartSidebarDrawer } from "./cart-sidebar-drawer";
import { HeaderAccountMenu } from "./header-account-menu";
import Link from "next/link";
import Image from "next/image";
import TypeIt from "typeit-react";

const navLinks = [
	{ label: "Orders", href: "/orders" },
	{ label: "Returns", href: "/returns" },
	{ label: "Shop", href: "/" },
];

export function Header() {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur-sm">
			<div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
				{/* Hamburger - mobile only */}
				<Button
					variant="ghost"
					size="icon"
					className="shrink-0 md:hidden"
					aria-label="Menu"
					aria-expanded={menuOpen}
					onClick={() => setMenuOpen((o) => !o)}
				>
					{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
				</Button>

				{/* Brand - flex-1 pushes the account/cart cluster right. The animated
				    wordmark is decorative, so it's hidden on the narrowest screens
				    (where it wouldn't fit) rather than truncated. */}
				<Link href="/" className="flex flex-1 items-center gap-2">
					<Image
						src="/amys-logo-final.png"
						alt="LittleBrick3DPrinting"
						width={56}
						height={56}
						priority
						className="size-11 shrink-0 md:size-14"
					/>
					<span className="hidden shrink-0 font-serif text-lg italic leading-none whitespace-nowrap sm:inline md:text-xl">
						<TypeIt
							options={{
								loop: true,
								speed: 50,
								deleteSpeed: 30,
								waitUntilVisible: true,
							}}
							getBeforeInit={(instance) => {
								instance
									.type("LittleBrick3DPrinting")
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

				{/* Desktop nav */}
				<nav className="hidden items-center gap-1 md:flex">
					{navLinks.map((link) => (
						<Button key={link.label} variant="ghost" size="sm" asChild>
							<Link
								href={link.href}
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								{link.label}
							</Link>
						</Button>
					))}
				</nav>

				{/* Account + cart - always visible */}
				<div className="flex shrink-0 items-center gap-1">
					<HeaderAccountMenu />
					<CartSidebarDrawer />
				</div>
			</div>

			{/* Mobile menu - drops down under the header */}
			<AnimatePresence>
				{menuOpen && (
					<>
						<motion.div
							className="fixed inset-0 z-10 bg-black/20 md:hidden"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setMenuOpen(false)}
						/>
						<motion.nav
							key="mobile-menu"
							initial={{ height: 0 }}
							animate={{ height: "auto" }}
							exit={{ height: 0 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
							className="absolute inset-x-0 top-full z-20 overflow-hidden border-t bg-background shadow-lg md:hidden"
						>
							<div className="flex flex-col p-2">
								{navLinks.map((link) => (
									<Button
										key={link.label}
										variant="ghost"
										className="justify-start text-muted-foreground hover:text-foreground"
										asChild
									>
										<Link href={link.href} onClick={() => setMenuOpen(false)}>
											{link.label}
										</Link>
									</Button>
								))}
							</div>
						</motion.nav>
					</>
				)}
			</AnimatePresence>
		</header>
	);
}

export default Header;
