import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { InventoryItem } from "@/lib/types";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import PreviewRoom, { SlotColors } from "./preview-room";

/**
 * Builds the 3D preview from the item's 3MF color picker field: its file and
 * each region's color keyed by slot. Regions without a selection preview in
 * their first option's color. Only the first 3MF field is previewed.
 */
function buildPreview(
	item: InventoryItem,
	fieldSelections: Record<number, Set<number>>,
): { url: string; slotColors: SlotColors } | null {
	const field = item.fields?.find((f) => f.field_type === "three_mf_color_picker" && f.threeMFUrl);
	if (!field?.threeMFUrl) return null;

	const selected = fieldSelections[field.id];
	const slotColors: SlotColors = {};
	for (const region of field.regions ?? []) {
		const chosen = region.options.find((o) => selected?.has(o.id)) ?? region.options[0];
		if (chosen) slotColors[region.slotIndex] = chosen.selectedColor.hex;
	}
	return { url: field.threeMFUrl, slotColors };
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
	const preview = useMemo(() => buildPreview(product, fieldSelections), [product, fieldSelections]);

	return (
		<motion.div layoutId={layoutId} className="relative aspect-square w-full overflow-hidden rounded-2xl">
			<AnimatePresence>
				{showPreview && preview ? (
					<motion.div
						key="preview"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="absolute inset-0"
					>
						<PreviewRoom url={preview.url} slotColors={preview.slotColors} />
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

						{preview && (
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
