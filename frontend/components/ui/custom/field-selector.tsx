import { InventoryItemField, InventoryItemFieldStlOption } from "@/lib/types";
import { FieldRadioGroup } from "./field-radio-group";
import { FieldChecklist } from "./field-checklist";
import { FieldColorPicker } from "./field-color-picker";

export function FieldSelector({
	field,
	selected,
	onChange,
	onColorSelected,
}: {
	field: InventoryItemField;
	selected: Set<number>;
	onChange: (next: Set<number>) => void;
	onColorSelected?: () => void;
}) {
	if (field.field_type === "radio_group") {
		return <FieldRadioGroup field={field} selected={selected} onChange={onChange} />;
	}

	if (field.field_type === "checklist") {
		return <FieldChecklist field={field} selected={selected} onChange={onChange} />;
	}

	if (field.field_type === "color_picker") {
		return (
			<FieldColorPicker
				field={{ ...field, options: field.options as InventoryItemFieldStlOption[] }}
				selected={selected}
				onChange={(next) => {
					onChange(next);
					onColorSelected?.();
				}}
			/>
		);
	}

	return null;
}
