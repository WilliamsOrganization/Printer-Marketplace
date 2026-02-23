"use client";
import { Card, CardContent, CardFooter } from "../card";
import Image from "next/image";
import { AddToCartButton } from "./add-to-cart-button";
import { InventoryItem, ItemBadge } from "@/lib/types";
import { Badge } from "../badge";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../button";
import { useState } from "react";
import { ProductCarousel } from "./product-carousel";
import { X } from "lucide-react";

const MotionCard = motion(Card);

function ProductCard({ products }: { products: InventoryItem[] }) {
	const [selected, setSelected] = useState<InventoryItem | null>(null);
	return (
		<>
			<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
				{products.map((product, i) => (
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
									src={product.imageUrl?.[0] || `/stock-${i + 1}.jpg`}
									alt={product.itemTitle}
									fill
									className="object-cover group-hover:scale-105 transition-transform"
								/>
							</div>
						</CardContent>

						<CardFooter className="flex flex-col items-start gap-2 p-4 mt-auto pt-0">
							<div className="flex flex-row justify-between min-w-full">
								<motion.p
									layoutId={`title-${product.id}`}
									className="font-bold line-clamp-1"
								>
									{product.itemTitle}
								</motion.p>
								<p className="font-bold">${product.itemCost.toFixed(2)}</p>
							</div>
							<p className="text-muted-foreground line-clamp-2">
								{product.itemDescription}
							</p>
							<Button
								className="w-full"
								onClick={() => setSelected(product)}
								variant="outline"
							>
								See More
							</Button>
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
							className="fixed inset-0 bg-black/50 z-10"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setSelected(null)}
						/>

						{/* Expanded card */}
						<motion.div
							layoutId={`card-${selected.id}`}
							className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white rounded-2xl shadow-2xl overflow-hidden w-[800px] max-w-[90vw] max-h-[85vh] flex"
						>
							{/* Left — Carousel */}
							<div className="w-1/2 shrink-0 bg-muted self-stretch flex items-center">
								<ProductCarousel product={selected} />
							</div>

							{/* Right — Product info */}
							<div className="flex flex-col flex-1 p-8 overflow-y-auto">
								{/* Title + close */}
								<div className="flex items-start justify-between mb-6">
									<div className="flex flex-col gap-2">
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
									</div>
									<Button
										size="icon"
										variant="ghost"
										className="shrink-0 rounded-full"
										onClick={() => setSelected(null)}
									>
										<X className="size-5" />
									</Button>
								</div>

								{/* Price */}
								<p className="text-3xl font-bold tracking-tight mb-4">
									${selected.itemCost.toFixed(2)}
								</p>

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
								<div className="mt-8">
									<AddToCartButton itemId={selected.id} quantity={1} />
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
