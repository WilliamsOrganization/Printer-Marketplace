import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { InventoryItem, InventoryItemFieldStlOption, StlChunk, StlColorHex } from "@/lib/types";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import PreviewRoom from "./preview-room";

/**
 * Builds StlChunks from all color_picker fields on an item.
 * Each color picker field has one stlUrl shared by all its color options.
 * The selected color option determines the color for that chunk.
 * If no selection, defaults to the first option's color.
 */
function buildChunks(
	item: InventoryItem,
	fieldSelections: Record<number, Set<number>>,
): StlChunk[] {
	const chunks: StlChunk[] = [];
	if (!item.fields) return chunks;

	for (const field of item.fields) {
		if (field.field_type !== "color_picker" || !field.stlUrl) continue;

		const stlOptions = field.options as InventoryItemFieldStlOption[];
		const selected = fieldSelections[field.id];
		let chosenOption = stlOptions[0];
		if (selected && selected.size > 0) {
			const found = stlOptions.find((o) => selected.has(o.id));
			if (found) chosenOption = found;
		}
		if (!chosenOption) continue;

		chunks.push({
			url: field.stlUrl,
			color: StlColorHex[chosenOption.selectedColor] ?? "#808080",
			position: [0, 0, 0],
		});
	}

	return chunks;
}

export function ProductCarousel({
	product,
	layoutId,
	fieldSelections,
	showPreview,
	onShowPreviewChange,
}: {
	product: InventoryItem;
	layoutId?: string;
	fieldSelections: Record<number, Set<number>>;
	showPreview: boolean;
	onShowPreviewChange: (show: boolean) => void;
}) {
	const images = product.imageUrls?.length ? product.imageUrls : ["/stock-1.jpg"];
	const chunks = buildChunks(product, fieldSelections);
	const has3d = chunks.length > 0;

	return (
		<motion.div layoutId={layoutId} className="relative aspect-square w-full overflow-hidden rounded-2xl">
			<AnimatePresence>
				{showPreview && has3d ? (
					<motion.div
						key="preview"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="absolute inset-0"
					>
						<PreviewRoom chunks={chunks} />
						<button
							onClick={() => onShowPreviewChange(false)}
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
								))}
							</CarouselContent>
							<CarouselPrevious className="top-auto bottom-4 left-4 translate-y-0" />
							<CarouselNext className="top-auto bottom-4 right-4 translate-y-0" />
						</Carousel>

						{has3d && (
							<div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-end justify-center pb-4 pointer-events-none">
								<button
									onClick={() => onShowPreviewChange(true)}
									className="pointer-events-auto font-serif italic text-white text-sm bg-black/40 backdrop-blur-sm px-4 py-1.5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
								>
									View in 3D
								</button>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
