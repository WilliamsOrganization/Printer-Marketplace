import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { COLOR_VARIANTS, InventoryItem, StlChunk } from "@/lib/types";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import PreviewRoom from "./preview-room";



export function ProductCarousel({
	product,
	layoutId,
}: {
	product: InventoryItem;
	/** Shared layoutId for the whole carousel container, so it morphs from the grid card's image instead of popping in. */
	layoutId?: string;
}) {
	const [showPreview, setShowPreview] = useState(false);
	const allSphereColors: StlChunk[] = [
		{
			url: "/sphere_thirds_stl/sphere_top_third.stl",
			color: COLOR_VARIANTS.red,
			position: [0, 0, 0],
		},
		{
			url: "/sphere_thirds_stl/sphere_middle_third.stl",
			color: COLOR_VARIANTS.green,
			position: [0, 0, 0],
		},
		{
			url: "/sphere_thirds_stl/sphere_bottom_third.stl",
			color: COLOR_VARIANTS.blue,
			position: [0, 0, 0],
		}
	]
	const images = product.imageUrls?.length ? product.imageUrls : ["/stock-1.jpg"];

	return (
		<motion.div layoutId={layoutId} className="relative aspect-square w-full overflow-hidden rounded-2xl">
			<AnimatePresence>
				{showPreview && allSphereColors ? (
					<motion.div
						key="preview"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="absolute inset-0"
					>
						<PreviewRoom chunks={allSphereColors} />
						<button
							onClick={() => setShowPreview(false)}
							className="absolute bottom-4 left-1/2 -translate-x-1/2 font-serif italic text-white text-sm bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded"
						>
							Back to photos
						</button>
					</motion.div>
				) : (
					<motion.div
						key="carousel"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="group absolute inset-0"
					>
						<Carousel className="w-full h-full">
							<CarouselContent className="h-full -ml-0">
								{images.map((src, index) => (
									<CarouselItem key={index} className="pl-0">
										<div className="relative aspect-square w-full">
											<Image
												src={src}
												alt={product.itemTitle}
												fill
												className="object-cover"
											/>
										</div>
									</CarouselItem>
								))
								}
							</CarouselContent>
							<CarouselPrevious className="top-auto bottom-4 left-4 translate-y-0" />
							<CarouselNext className="top-auto bottom-4 right-4 translate-y-0" />
						</Carousel>

						{/* Hover overlay — swap to the 3D room preview */}
						<div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-end justify-center pb-4 pointer-events-none">
							<button
								onClick={() => setShowPreview(true)}
								className="pointer-events-auto font-serif italic text-white text-sm bg-black/40 backdrop-blur-sm px-4 py-1.5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
							>
								View in room
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
