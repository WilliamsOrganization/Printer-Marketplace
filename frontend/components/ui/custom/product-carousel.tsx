import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { InventoryItem } from "@/lib/types";
import Image from "next/image";

export function ProductCarousel({ product }: { product: InventoryItem }) {
	return (
		<Carousel className="w-full h-full">
			<CarouselContent className="h-full">
				{Array.from({ length: 3 }).map((_, index) => (
					<CarouselItem key={index}>
						<div className="relative aspect-square w-full">
							<Image
								src={product.imageUrl?.[index] || `/stock-${index + 1}.jpg`}
								alt={product.itemTitle}
								fill
								className="object-cover"
							/>
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious className="top-auto bottom-4 left-4 translate-y-0" />
			<CarouselNext className="top-auto bottom-4 right-4 translate-y-0" />
		</Carousel>
	);
}
