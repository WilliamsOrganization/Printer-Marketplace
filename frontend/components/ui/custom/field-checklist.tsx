import { InventoryItemField } from "@/lib/types";
import { Checkbox } from "../checkbox";
import { Label } from "../label";

export function FieldChecklist({
	field,
	selected,
	onChange,
}: {
	field: InventoryItemField;
	selected: Set<number>;
	onChange: (next: Set<number>) => void;
}) {
	const formatPrice = (price: number) =>
		price > 0 ? ` (+$${price.toFixed(2)})` : "";

	const toggle = (id: number) => {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		onChange(next);
	};

	return (
		<div className="flex flex-col gap-2">
			<Label className="text-sm font-medium">{field.label}</Label>
			{field.description && (
				<p className="text-xs text-muted-foreground">{field.description}</p>
			)}
			{field.options.map((opt) => (
				<div key={opt.id} className="flex items-center gap-2">
					<Checkbox
						id={`opt-${opt.id}`}
						checked={selected.has(opt.id)}
						onCheckedChange={() => toggle(opt.id)}
					/>
					<Label htmlFor={`opt-${opt.id}`} className="text-sm font-normal cursor-pointer">
						{opt.label}{formatPrice(opt.price)}
					</Label>
				</div>
			))}
		</div>
	);
}
