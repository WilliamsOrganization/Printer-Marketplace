"use client";
import { Card, CardContent, CardFooter } from "../card";
import Image from "next/image";
import { AddToCartButton } from "./add-to-cart-button";
import { InventoryItem, ItemBadge } from "@/lib/types";
import { Badge } from "../badge";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../button";
import { useState } from "react";

const MotionCard = motion(Card);

function ProductCard({ products }: { products: InventoryItem[] }) {
	const [selected, setSelected] = useState<InventoryItem | null>(null);
	return (
		<>
			<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
				{products.map((product) => (
					<MotionCard
						key={product.id}
						layoutId={`card-${product.id}`}
						className="group overflow-hidden flex flex-col p-0"
					>
						<CardContent className="p-0">
							<div className="relative aspect-square bg-muted">
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
									src={product.imageUrl?.[0] || "/globe.svg"}
									alt={product.itemTitle}
									fill
									className="object-cover p-8 group-hover:scale-105 transition-transform"
								/>
							</div>
						</CardContent>

						<CardFooter className="flex flex-col items-start gap-2 p-4 mt-auto pt-0">
							<div className="flex flex-row justify-between min-w-full ">
								<p className="font-bold line-clamp-1">{product.itemTitle}</p>
								<p className="font-bold">${product.itemCost.toFixed(2)}</p>
							</div>

							<p className="text-muted-foreground line-clamp-2">
								{product.itemDescription}
							</p>
							<Button
								asChild
								onClick={() => {
									setSelected(product);
								}}
							>
								<motion.div
									key={product.id}
									layoutId={`card-${product.id}`}
									className="w-full"
								>
									Expand Me
								</motion.div>
							</Button>
							<AddToCartButton itemId={product.id} quantity={1} />
						</CardFooter>
					</MotionCard>
				))}
			</div>

			<AnimatePresence>
				{selected && (
					<>
						{/* Backdrop */}
						<motion.div
							className="fixed inset-0 bg-black/50 z-10"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setSelected(null)}
						/>

						{/* Expanded card — same layoutId as the grid card */}
						<motion.div
							layoutId={`card-${selected.id}`} // ← matches grid card
							className="fixed inset-10 z-20 bg-white rounded-2xl p-8 shadow-2xl"
						>
							<motion.h2 layoutId={`title-${selected.id}`}>
								{selected.itemTitle}
							</motion.h2>
							<p>{selected.itemDescription}</p>
							<button onClick={() => setSelected(null)}>Close</button>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}

export default ProductCard;
