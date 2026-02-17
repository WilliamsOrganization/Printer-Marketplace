"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavigationMenuDemo } from "./navigation";
import { ChevronDown } from "lucide-react";

export function Header() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			{/* Backdrop with blur */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10"
					onClick={() => setIsOpen(false)}
				/>
			)}

			<div className="sticky top-0 w-full z-20">
				{/* Header bar */}
				<div className="flex items-center justify-between px-4 py-2 border-b bg-background">
					<Button variant="ghost" onClick={() => setIsOpen(!isOpen)}>
						Product details
						<ChevronDown
							className={`ml-2 h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
						/>
					</Button>

					<NavigationMenuDemo />
				</div>

				{/* Drawer - expands from bottom of header */}
				<div
					className={`absolute left-0 right-0 z-20 bg-background border-b shadow-lg grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
						}`}
				>
					<div className="overflow-hidden">
						<div className="p-4">
							<h3 className="font-semibold">Product details</h3>
							<p className="text-sm text-muted-foreground mt-2">
								This panel expands from the header and overlays the page
								content.
							</p>
							<Button size="sm" className="mt-4">
								Learn More
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
export default Header;
