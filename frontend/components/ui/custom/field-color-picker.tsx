import { InventoryItemFieldStlOption, StlColor, StlColorHex } from "@/lib/types";
import { Label } from "../label";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const RAINBOW_ORDER: StlColor[] = [
	StlColor.RED, StlColor.ORANGE, StlColor.YELLOW, StlColor.GREEN,
	StlColor.BLUE, StlColor.PURPLE, StlColor.PINK,
	StlColor.BROWN, StlColor.GREY, StlColor.WHITE, StlColor.BLACK,
];

export function FieldColorPicker({
	field,
	selected,
	onChange,
}: {
	field: { label: string; description: string; options: InventoryItemFieldStlOption[] };
	selected: Set<number>;
	onChange: (next: Set<number>) => void;
}) {
	const formatPrice = (price: number) =>
		price > 0 ? ` (+$${price.toFixed(2)})` : "";

	const sortedOptions = [...field.options].sort((a, b) =>
		RAINBOW_ORDER.indexOf(a.selectedColor) - RAINBOW_ORDER.indexOf(b.selectedColor)
	);
	const selectedOpt = field.options.find((o) => selected.has(o.id));

	return (
		<div className="flex flex-col gap-3">
			<div>
				<Label className="text-sm font-medium">
					{field.label}
					{selectedOpt && (
						<span className="font-normal text-muted-foreground">
							{" "}&mdash; {selectedOpt.label}
						</span>
					)}
				</Label>
				{field.description && (
					<p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
				)}
			</div>

			<div className="flex flex-wrap gap-3 p-3">
				{sortedOptions.map((opt) => {
					const hex = StlColorHex[opt.selectedColor] ?? "#888";
					const isSelected = selected.has(opt.id);
					const isLight = ["#FFFFFF", "#FFFF00", "#FFC0CB", "#FFA500"].includes(hex);

					return (
						<button
							key={opt.id}
							type="button"
							title={`${opt.label}${formatPrice(opt.price)}`}
							className={cn(
								"relative size-8 rounded-full transition-all duration-200",
								"border-2 shadow-sm",
								isSelected
									? "border-foreground ring-2 ring-offset-2 ring-foreground/40 scale-110"
									: "border-muted-foreground/20 hover:border-muted-foreground/50 hover:scale-105 hover:shadow-md",
							)}
							style={{ backgroundColor: hex }}
							onClick={() => onChange(new Set([opt.id]))}
						>
							{isSelected && (
								<Check
									className={cn(
										"absolute inset-0 m-auto size-4",
										isLight ? "text-black" : "text-white",
									)}
									strokeWidth={3}
								/>
							)}
						</button>
					);
				})}
			</div>

			{selectedOpt && selectedOpt.price > 0 && (
				<p className="text-xs text-muted-foreground">
					+${selectedOpt.price.toFixed(2)}
				</p>
			)}
		</div>
	);
}
