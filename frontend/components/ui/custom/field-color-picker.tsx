import { InventoryItemFieldThreeMFRegion } from "@/lib/types";
import { Label } from "../label";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/** Whether a #RRGGBB color needs dark text on top of it. */
function isLight(hex: string) {
	const n = parseInt(hex.slice(1), 16);
	const luminance = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 0xff) + 0.114 * (n & 0xff);
	return luminance > 160;
}

/**
 * One row of color swatches per 3MF region. `selected` holds one option id
 * per region; picking a color swaps out that region's previous one.
 */
export function FieldColorPicker({
	field,
	selected,
	onChange,
}: {
	field: { label: string; description: string; regions: InventoryItemFieldThreeMFRegion[] };
	selected: Set<number>;
	onChange: (next: Set<number>) => void;
}) {
	const formatPrice = (price: number) =>
		price > 0 ? ` (+$${price.toFixed(2)})` : "";

	const pick = (region: InventoryItemFieldThreeMFRegion, optionId: number) => {
		const next = new Set(selected);
		for (const opt of region.options) next.delete(opt.id);
		next.add(optionId);
		onChange(next);
	};

	return (
		<div className="flex flex-col gap-3">
			<div>
				<Label className="text-sm font-medium">{field.label}</Label>
				{field.description && (
					<p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
				)}
			</div>

			{[...field.regions]
				.sort((a, b) => a.slotIndex - b.slotIndex)
				.map((region) => {
					const selectedOpt = region.options.find((o) => selected.has(o.id));
					return (
						<div key={region.id} className="flex flex-col gap-1">
							<p className="text-xs font-medium">
								{region.name}
								{selectedOpt && (
									<span className="font-normal text-muted-foreground">
										{" "}&mdash; {selectedOpt.selectedColor.name}
										{formatPrice(selectedOpt.price)}
									</span>
								)}
							</p>

							<div className="flex flex-wrap gap-3 p-3">
								{region.options.map((opt) => {
									const hex = opt.selectedColor.hex;
									const isSelected = selected.has(opt.id);

									return (
										<button
											key={opt.id}
											type="button"
											title={`${opt.selectedColor.name}${formatPrice(opt.price)}`}
											className={cn(
												"relative size-8 rounded-full transition-all duration-200",
												"border-2 shadow-sm",
												isSelected
													? "border-foreground ring-2 ring-offset-2 ring-foreground/40 scale-110"
													: "border-muted-foreground/20 hover:border-muted-foreground/50 hover:scale-105 hover:shadow-md",
											)}
											style={{ backgroundColor: hex }}
											onClick={() => pick(region, opt.id)}
										>
											{isSelected && (
												<Check
													className={cn(
														"absolute inset-0 m-auto size-4",
														isLight(hex) ? "text-black" : "text-white",
													)}
													strokeWidth={3}
												/>
											)}
										</button>
									);
								})}
							</div>
						</div>
					);
				})}
		</div>
	);
}
