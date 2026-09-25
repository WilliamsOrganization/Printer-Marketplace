import { InventoryItemField } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { Label } from "../label";

export function FieldRadioGroup({
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

	return (
		<div className="flex flex-col gap-2">
			<Label className="text-sm font-medium">{field.label}</Label>
			{field.description && (
				<p className="text-xs text-muted-foreground">{field.description}</p>
			)}
			<RadioGroup
				value={selected.size ? String([...selected][0]) : undefined}
				onValueChange={(val) => onChange(new Set([Number(val)]))}
			>
				{field.options.map((opt) => (
					<div key={opt.id} className="flex items-center gap-2">
						<RadioGroupItem value={String(opt.id)} id={`opt-${opt.id}`} />
						<Label htmlFor={`opt-${opt.id}`} className="text-sm font-normal cursor-pointer">
							{opt.label}{formatPrice(opt.price)}
						</Label>
					</div>
				))}
			</RadioGroup>
		</div>
	);
}
