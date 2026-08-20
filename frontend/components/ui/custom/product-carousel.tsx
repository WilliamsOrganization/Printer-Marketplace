import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { InventoryItem } from "@/lib/types";
import Image from "next/image";
import { motion } from "framer-motion";

export function ProductCarousel({
	product,
	layoutId,
}: {
	product: InventoryItem;
	/** Shared layoutId for the first slide, so it morphs from the grid card's image instead of popping in. */
	layoutId?: string;
}) {
	const images = product.imageUrls?.length ? product.imageUrls : ["/stock-1.jpg"];

	return (
		<Carousel className="w-full h-full">
			<CarouselContent className="h-full -ml-0">
				{images.map((src, index) => (
					<CarouselItem key={index} className="pl-0">
						<motion.div
							layoutId={index === 0 ? layoutId : undefined}
							className="relative aspect-square w-full"
						>
							<Image
								src={src}
								alt={product.itemTitle}
								fill
								className="object-cover"
							/>
						</motion.div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious className="top-auto bottom-4 left-4 translate-y-0" />
			<CarouselNext className="top-auto bottom-4 right-4 translate-y-0" />
		</Carousel>
	);
}
