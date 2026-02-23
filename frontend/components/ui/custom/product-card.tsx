"use client";
import { Card, CardContent, CardFooter } from "../card";
import Image from "next/image";
import { AddToCartButton } from "./add-to-cart-button";
import { InventoryItem, ItemBadge } from "@/lib/types";
import { Badge } from "../badge";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../button";
import { useEffect, useState } from "react";
import { ProductCarousel } from "./product-carousel";
import { X } from "lucide-react";

const MotionCard = motion(Card);

function ProductCard({ products }: { products: InventoryItem[] }) {
	const [selected, setSelected] = useState<InventoryItem | null>(null);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setSelected(null);
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<>
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				{products.map((product, i) => (
					<MotionCard
						key={product.id}
						layoutId={`card-${product.id}`}
						className="group overflow-hidden flex flex-col p-0 py-0 gap-0 hover:shadow-lg transition-shadow duration-200"
					>
						{/* Image — clicking opens modal */}
						<CardContent
							className="p-0 cursor-pointer"
							onClick={() => setSelected(product)}
						>
							<div className="relative aspect-square bg-muted overflow-hidden">
								{product.badge && (
									<Badge
										className="absolute top-2 left-2 z-10"
										variant={
											product.badge === ItemBadge.SALE
												? "destructive"
												: "secondary"
										}
									>
										{product.badge}
									</Badge>
								)}
								<Image
									src={product.imageUrl?.[0] || `/stock-${i + 1}.jpg`}
									alt={product.itemTitle}
									fill
									className="object-cover group-hover:scale-105 transition-transform duration-300"
								/>
								{/* Hover overlay */}
								<div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-end justify-center pb-4">
									<span className="text-white text-xs font-semibold bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
										View Details
									</span>
								</div>
							</div>
						</CardContent>

						<CardFooter className="flex flex-col items-start gap-3 p-4">
							<div className="w-full">
								<div className="flex items-start justify-between gap-2">
									<motion.p
										layoutId={`title-${product.id}`}
										className="font-semibold leading-snug line-clamp-1"
									>
										{product.itemTitle}
									</motion.p>
									<p className="font-bold text-sm shrink-0">
										${product.itemCost.toFixed(2)}
									</p>
								</div>
								<p className="text-xs text-muted-foreground mt-0.5 capitalize">
									{product.category.toLowerCase()}
								</p>
							</div>
							<AddToCartButton item={product} quantity={1} />
						</CardFooter>
					</MotionCard>
				))}
			</div>

			<AnimatePresence>
				{selected && (
					<>
						{/* Backdrop */}
						<motion.div
							className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setSelected(null)}
						/>

						{/* Expanded card */}
						<motion.div
							layoutId={`card-${selected.id}`}
							className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-background rounded-2xl shadow-2xl overflow-hidden w-[1100px] max-w-[90vw] max-h-[90vh] flex"
						>
							{/* Close button */}
							<Button
								size="icon"
								variant="ghost"
								className="absolute top-3 right-3 z-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-muted"
								onClick={() => setSelected(null)}
							>
								<X className="size-4" />
							</Button>

							{/* Left — Carousel */}
							<div className="w-1/2 shrink-0 bg-muted self-stretch flex items-center">
								<ProductCarousel product={selected} />
							</div>

							{/* Right — Product info */}
							<div className="flex flex-col flex-1 p-8 overflow-y-auto">
								{/* Badge + title */}
								<div className="flex flex-col gap-2 mb-2 pr-10">
									{selected.badge && (
										<Badge
											variant={
												selected.badge === ItemBadge.SALE
													? "destructive"
													: "secondary"
											}
											className="w-fit"
										>
											{selected.badge}
										</Badge>
									)}
									<motion.h2
										layoutId={`title-${selected.id}`}
										className="text-2xl font-bold leading-tight"
									>
										{selected.itemTitle}
									</motion.h2>
									<p className="text-sm text-muted-foreground capitalize">
										{selected.category.toLowerCase()}
									</p>
								</div>

								{/* Price */}
								<div className="flex items-baseline gap-1 my-4">
									<span className="text-3xl font-bold tracking-tight">
										${selected.itemCost.toFixed(2)}
									</span>
									<span className="text-sm text-muted-foreground">CAD</span>
								</div>

								<div className="w-full h-px bg-border mb-4" />

								{/* Description */}
								<motion.p
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 8 }}
									className="text-sm text-muted-foreground leading-relaxed flex-1"
								>
									{selected.itemDescription}
								</motion.p>

								{/* CTA */}
								<div className="mt-8 pt-4 border-t">
									<AddToCartButton item={selected} quantity={1} />
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}

export default ProductCard;
