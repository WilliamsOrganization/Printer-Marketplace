"use client";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge, Link, ShoppingBasket } from "lucide-react";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../card";
import { IconTrendingUp } from "@tabler/icons-react";
import { AddToCartButton } from "./cart-submit-button";

export function CartSidebarDrawer() {
	return (
		<Drawer direction="right">
			<DrawerTrigger asChild>
				<Button variant="outline">
					<ShoppingBasket />
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Move Goal</DrawerTitle>
					<DrawerDescription>Set your daily activity goal.</DrawerDescription>
				</DrawerHeader>
				<div className="no-scrollbar overflow-y-auto px-4">
					{Array.from({ length: 10 }).map((_, index) => (
						<p
							key={index}
							className="style-lyra:mb-2 style-lyra:leading-relaxed mb-4 leading-normal"
						>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
							eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
							enim ad minim veniam, quis nostrud exercitation ullamco laboris
							nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
							reprehenderit in voluptate velit esse cillum dolore eu fugiat
							nulla pariatur. Excepteur sint occaecat cupidatat non proident,
							sunt in culpa qui officia deserunt mollit anim id est laborum.
						</p>
					))}
				</div>
				<DrawerFooter>
					<Button>Submit</Button>
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

function ListItem({
	title,
	children,
	href,
	...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
	return (
		<li {...props}>
			<Card key={product.id} className="group overflow-hidden">
				<CardContent className="p-0">
					<div className="relative aspect-square bg-muted">
						{product.badge && (
							<Badge className="absolute top-2 left-2 z-10" variant={ product.badge === ItemBadge.SALE ? "destructive" : "secondary" } >
								{product.badge}
							</Badge>
						)}
						<Image src={product.imageUrl?.[0] || "/globe.svg"} alt={product.itemTitle} fill className="object-contain p-8 group-hover:scale-105 transition-transform" />
					</div>
				</CardContent>
				<CardFooter className="flex flex-col items-start gap-2 p-4">
					<div className="flex flex-row justify-between min-w-full">
						<p className="font-bold">{product.itemTitle}</p>
						<p className="font-bold">${product.itemCost.toFixed(2)}</p>
					</div>

					<p className="text-muted-foreground">{product.itemDescription}</p>
					{/* TODO: remember to implement the quantity */}
					<AddToCartButton itemId={product.id} quantity={1} />
				</CardFooter>
			</Card>
		</li>
	);
}
export default CartSidebarDrawer;
