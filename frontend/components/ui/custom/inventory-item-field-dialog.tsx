"use client";

import { useState } from "react";
import type { InventoryItemField } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ImageDropField } from "@/components/ui/custom/image-drop-field";

// ── Field type constants ───────────────────────────────────────────────
const FIELD_TYPES = {
	RADIO_GROUP: "radio-group",
	CHECKLIST: "dropdown",
	COLOR_PICKER: "stl",
} as const;

type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
	"radio-group": "Radio Group",
	dropdown: "Checklist / Dropdown",
	stl: "Color Picker (STL)",
};

// ── STL color enum mirroring backend ───────────────────────────────────
const STL_COLORS = [
	{ value: "RED", label: "Red", hex: "#FF0000" },
	{ value: "ORANGE", label: "Orange", hex: "#FFA500" },
	{ value: "YELLOW", label: "Yellow", hex: "#FFFF00" },
	{ value: "GREEN", label: "Green", hex: "#008000" },
	{ value: "BLUE", label: "Blue", hex: "#0000FF" },
	{ value: "PURPLE", label: "Purple", hex: "#800080" },
	{ value: "PINK", label: "Pink", hex: "#FFC0CB" },
	{ value: "BROWN", label: "Brown", hex: "#A52A2A" },
	{ value: "GREY", label: "Grey", hex: "#808080" },
	{ value: "WHITE", label: "White", hex: "#FFFFFF" },
	{ value: "BLACK", label: "Black", hex: "#000000" },
] as const;

// ── Option row shapes ──────────────────────────────────────────────────
type DropdownOption = { label: string; price: string };
type StlOption = { label: string; price: string; selectedColor: string };

const emptyDropdownOption = (): DropdownOption => ({ label: "", price: "" });

const defaultStlOptions = (): StlOption[] =>
	STL_COLORS.map((c) => ({
		label: c.label,
		price: "0",
		selectedColor: c.value,
	}));

// ── Props ──────────────────────────────────────────────────────────────
type InventoryItemFieldDialogProps = {
	trigger?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Called after a field is successfully created, with the response data. */
	onFieldCreated?: (field: InventoryItemField) => void;
};

export function InventoryItemFieldDialog({
	trigger,
	open: controlledOpen,
	onOpenChange,
	onFieldCreated,
}: InventoryItemFieldDialogProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	const open = controlledOpen ?? uncontrolledOpen;
	const setOpen = onOpenChange ?? setUncontrolledOpen;

	// ── form state ──────────────────────────────────────────────────────
	const [fieldType, setFieldType] = useState<FieldType>(FIELD_TYPES.RADIO_GROUP);
	const [label, setLabel] = useState("");
	const [description, setDescription] = useState("");
	const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([emptyDropdownOption()]);
	const [stlOptions, setStlOptions] = useState<StlOption[]>(defaultStlOptions());
	const [stlFile, setStlFile] = useState<File[]>([]);

	const isStl = fieldType === FIELD_TYPES.COLOR_PICKER;
	const options = isStl ? stlOptions : dropdownOptions;

	const isValid =
		label.trim().length > 0 &&
		description.trim().length > 0 &&
		options.length > 0 &&
		options.every((opt) => opt.label.trim().length > 0 && opt.price !== "" && !isNaN(Number(opt.price)) && Number(opt.price) >= 0) &&
		(!isStl || stlFile.length > 0);

	function resetForm() {
		setFieldType(FIELD_TYPES.RADIO_GROUP);
		setLabel("");
		setDescription("");
		setDropdownOptions([emptyDropdownOption()]);
		setStlOptions(defaultStlOptions());
		setStlFile([]);
	}

	// ── option helpers ──────────────────────────────────────────────────
	function addOption() {
		if (isStl) {
			setStlOptions((prev) => [...prev, { label: "", price: "0", selectedColor: "BLACK" }]);
		} else {
			setDropdownOptions((prev) => [...prev, emptyDropdownOption()]);
		}
	}

	function removeOption(index: number) {
		if (isStl) {
			setStlOptions((prev) => prev.filter((_, i) => i !== index));
		} else {
			setDropdownOptions((prev) => prev.filter((_, i) => i !== index));
		}
	}

	function updateDropdownOption(index: number, key: keyof DropdownOption, value: string) {
		setDropdownOptions((prev) =>
			prev.map((opt, i) => (i === index ? { ...opt, [key]: value } : opt)),
		);
	}

	function updateStlOption(index: number, key: keyof StlOption, value: string) {
		setStlOptions((prev) =>
			prev.map((opt, i) => (i === index ? { ...opt, [key]: value } : opt)),
		);
	}

	// ── submit ──────────────────────────────────────────────────────────
	function handleSubmit(e: { preventDefault: () => void; stopPropagation: () => void }) {
		e.preventDefault();
		e.stopPropagation();

		if (!label.trim()) {
			toast.error("Field label is required");
			return;
		}
		if (!description.trim()) {
			toast.error("Field description is required");
			return;
		}
		if (options.length === 0) {
			toast.error("At least one option is required");
			return;
		}

		for (const opt of options) {
			if (!opt.label.trim()) {
				toast.error("All options must have a label");
				return;
			}
			if (opt.price === "" || isNaN(Number(opt.price)) || Number(opt.price) < 0) {
				toast.error("All options must have a valid price");
				return;
			}
		}

		if (isStl && stlFile.length === 0) {
			toast.error("An STL file is required for color picker fields");
			return;
		}

		const formattedOptions = isStl
			? stlOptions.map((opt) => ({
					label: opt.label,
					price: Number(opt.price),
					selectedColor: opt.selectedColor,
				}))
			: dropdownOptions.map((opt) => ({
					label: opt.label,
					price: Number(opt.price),
				}));

		// Map field type slug to discriminator value
		const fieldTypeMap: Record<string, string> = {
			"radio-group": "radio_group",
			dropdown: "checklist",
			stl: "color_picker",
		};

		const field: InventoryItemField & { _stlFile?: File } = {
			id: 0,
			label,
			description,
			field_type: fieldTypeMap[fieldType] as InventoryItemField["field_type"],
			options: formattedOptions as InventoryItemField["options"],
			...(isStl ? { _stlFile: stlFile[0] } : {}),
		};

		onFieldCreated?.(field);
		resetForm();
		setOpen(false);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto" onKeyDown={(e) => e.stopPropagation()}>
				<DialogHeader>
					<DialogTitle>Create Inventory Field</DialogTitle>
					<DialogDescription>
						Create a new configurable field with options that customers can choose from.
					</DialogDescription>
				</DialogHeader>

				<form id="inventory-field-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
					{/* ── Field type selector ────────────────────────────────── */}
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="fieldType">Field Type</FieldLabel>
							<Select value={fieldType} onValueChange={(v) => setFieldType(v as FieldType)}>
								<SelectTrigger id="fieldType" className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
										<SelectItem key={value} value={value}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldDescription>
								{fieldType === FIELD_TYPES.RADIO_GROUP && "Customers pick exactly one option."}
								{fieldType === FIELD_TYPES.CHECKLIST && "Customers can select multiple options."}
								{fieldType === FIELD_TYPES.COLOR_PICKER && "Customers pick a color for a 3D-printed part."}
							</FieldDescription>
						</Field>
					</FieldGroup>

					{/* ── Label & Description ────────────────────────────────── */}
					<div className="grid grid-cols-2 gap-4">
						<Field>
							<FieldLabel htmlFor="fieldLabel">Label</FieldLabel>
							<Input
								id="fieldLabel"
								placeholder='e.g. "Size" or "Filament Color"'
								value={label}
								onChange={(e) => setLabel(e.target.value)}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="fieldDescription">Description</FieldLabel>
							<Input
								id="fieldDescription"
								placeholder="Brief description of this field"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</Field>
					</div>

					{/* ── STL file upload ─────────────────────────────────────── */}
					{isStl && (
						<Field>
							<FieldLabel>STL File</FieldLabel>
							<FieldDescription>
								Upload the 3D model file that will be printed in the selected color.
							</FieldDescription>
							<ImageDropField
								name="stlFile"
								value={stlFile}
								onChange={setStlFile}
								maxFiles={1}
								accept={{ "model/stl": [".stl"], "application/octet-stream": [".stl"] }}
							/>
						</Field>
					)}

					{/* ── Options ─────────────────────────────────────────────── */}
					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between">
							<FieldLabel>Options</FieldLabel>
							<Button type="button" variant="outline" size="sm" onClick={addOption}>
								<Plus className="mr-1 size-4" />
								Add Option
							</Button>
						</div>

						{/* Column headers */}
						<div className={`grid gap-2 text-xs font-medium text-muted-foreground ${isStl ? "grid-cols-[1fr_80px_120px_32px]" : "grid-cols-[1fr_100px_32px]"}`}>
							<span>Label</span>
							<span>Price (cents)</span>
							{isStl && <span>Color</span>}
							<span />
						</div>

						{/* Option rows */}
						{!isStl &&
							dropdownOptions.map((opt, i) => (
								<div key={i} className="grid grid-cols-[1fr_100px_32px] gap-2">
									<Input
										placeholder="Option label"
										value={opt.label}
										onChange={(e) => updateDropdownOption(i, "label", e.target.value)}
									/>
									<Input
										type="number"
										min={0}
										placeholder="0"
										value={opt.price}
										onChange={(e) => updateDropdownOption(i, "price", e.target.value)}
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => removeOption(i)}
										disabled={dropdownOptions.length <= 1}
									>
										<Trash2 className="size-4" />
									</Button>
								</div>
							))}

						{isStl &&
							stlOptions.map((opt, i) => (
								<div key={i} className="grid grid-cols-[1fr_80px_120px_32px] gap-2">
									<Input
										placeholder="Option label"
										value={opt.label}
										onChange={(e) => updateStlOption(i, "label", e.target.value)}
									/>
									<Input
										type="number"
										min={0}
										placeholder="0"
										value={opt.price}
										onChange={(e) => updateStlOption(i, "price", e.target.value)}
									/>
									<Select
										value={opt.selectedColor}
										onValueChange={(v) => updateStlOption(i, "selectedColor", v)}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{STL_COLORS.map((c) => (
												<SelectItem key={c.value} value={c.value}>
													<span className="flex items-center gap-2">
														<span
															className="inline-block size-3 rounded-full border"
															style={{ backgroundColor: c.hex }}
														/>
														{c.label}
													</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => removeOption(i)}
										disabled={stlOptions.length <= 1}
									>
										<Trash2 className="size-4" />
									</Button>
								</div>
							))}
					</div>
				</form>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button type="submit" form="inventory-field-form" disabled={!isValid}>
						Create Field
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default InventoryItemFieldDialog;
