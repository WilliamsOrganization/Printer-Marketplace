import { InventoryItemFieldSelection, InventoryItem, InventoryItemField, SelectedField } from "./types";

// fieldId -> set of selected option ids, as tracked by the product modal
export type FieldSelections = Record<number, Set<number>>;

/**
 * Radio groups and 3MF color pickers must be answered before the item can go
 * in the cart. Checklists are optional add-ons, so selecting none of them is
 * valid.
 */
export function isFieldRequired(field: InventoryItemField): boolean {
	return field.field_type === "radio_group" || field.field_type === "three_mf_color_picker";
}

/**
 * Whether a field has enough selected to be added to the cart. A 3MF color
 * picker needs one color for every region, not just any selection.
 */
function isFieldAnswered(field: InventoryItemField, selected: Set<number> | undefined): boolean {
	if (field.field_type === "three_mf_color_picker") {
		return (field.regions ?? []).every((region) => region.options.some((o) => selected?.has(o.id)));
	}
	return (selected?.size ?? 0) > 0;
}

export function isConfigurable(item: InventoryItem): boolean {
	return (item.fields?.length ?? 0) > 0;
}

/**
 * Returns the required fields that don't have a selection yet.
 */
export function getMissingFields(
	item: InventoryItem,
	selections: FieldSelections,
): InventoryItemField[] {
	return (item.fields ?? []).filter(
		(field) => isFieldRequired(field) && !isFieldAnswered(field, selections[field.id]),
	);
}

/**
 * Converts the modal's selection state into the payload sent with
 * POST /cartitem. Only option ids that actually belong to the field are
 * kept, and fields with nothing selected are left out.
 */
export function toFieldSelectionPayload(
	item: InventoryItem,
	selections: FieldSelections,
): InventoryItemFieldSelection[] {
	const payload: InventoryItemFieldSelection[] = [];
	for (const field of item.fields ?? []) {
		const validIds = new Set(field.options.map((opt) => opt.id));
		const optionIds = [...(selections[field.id] ?? [])].filter((id) => validIds.has(id));
		if (optionIds.length > 0) {
			payload.push({ fieldId: field.id, optionIds });
		}
	}
	return payload;
}

/**
 * Renders the options chosen on a cart or order line as one line,
 * e.g. "Color: Red · Add-ons: Keyring". Empty for items without options.
 * Mirrors CartItem.describeConfiguration on the backend.
 */
export function describeConfiguration(fields: SelectedField[] | null | undefined): string {
	return (fields ?? [])
		.map((field) => `${field.label}: ${field.options.map((o) => o.label).join(", ")}`)
		.join(" · ");
}
