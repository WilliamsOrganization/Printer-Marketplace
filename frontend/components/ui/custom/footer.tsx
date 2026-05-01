import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Twitter, Instagram, Mail } from "lucide-react";

const footerLinks = {
	shop: [
		{ label: "All Products", href: "/" },
		// { label: "New Arrivals", href: "/shop?sort=new" },
		// { label: "Sale", href: "/shop?badge=SALE" },
	],
	company: [
		{ label: "About Us", href: "/about" },
		// { label: "Press", href: "/press" },
		// { label: "Blog", href: "/blog" },
	],
	support: [
		{ label: "Contact", href: "/contact" },
		{ label: "Shipping", href: "/shipping" },
		{ label: "Returns", href: "/returns" },
	],
	legal: [
		// { label: "Privacy Policy", href: "/privacy" },
		// { label: "Terms of Service", href: "/terms" },
		// { label: "Cookie Policy", href: "/cookies" },
	],
};

export function Footer() {
	return (
		<footer className="w-full border-t bg-muted/20 mt-auto">
			<div className="mx-auto max-w-7xl px-6 py-14">
				<div className="grid grid-cols-2 gap-10 md:grid-cols-5">
					{/* Brand + Newsletter */}
					<div className="col-span-2 flex flex-col gap-5">
						<div>
							<Image src="/logo.svg" alt="PrintMarket" width={450} height={150} className="mb-2" />
						</div>

						{false ?
							(
								<div>
									<p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
										Stay in the loop
									</p>
									<div className="flex gap-2">
										<Input
											placeholder="your@email.com"
											type="email"
											className="max-w-[200px] text-sm"
										/>
										<Button size="sm" variant="outline">
											<Mail className="size-3.5" />
											Subscribe
										</Button>
									</div>
								</div>
							): <></>
						}
					</div>

					{/* Link columns */}
					<div>
						<p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
							Shop
						</p>
						<ul className="space-y-2.5">
							{footerLinks.shop.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
							Company
						</p>
						<ul className="space-y-2.5">
							{footerLinks.company.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
							Support
						</p>
						<ul className="space-y-2.5">
							{footerLinks.support.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				<Separator className="my-6" />

				<div className="flex items-center justify-between">
					<p className="text-xs text-muted-foreground">
						&copy; {new Date().getFullYear()} PrintMarket. All rights reserved.
					</p>

					<div className="flex gap-2">
						<Button variant="ghost" size="icon" asChild>
							<Link href="https://twitter.com" target="_blank">
								<Twitter className="size-4" />
							</Link>
						</Button>
						<Button variant="ghost" size="icon" asChild>
							<Link href="https://instagram.com" target="_blank">
								<Instagram className="size-4" />
							</Link>
						</Button>
					</div>

					<p className="text-xs text-muted-foreground">
						Support A Small Local Canadian Business!
					</p>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
