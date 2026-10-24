"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type {
	Color,
	InventoryItemField,
	UnsavedInventoryItemFieldOptionsThreeMFColorRegion,
	UnsavedInventoryItemFieldThreeMFRegion,
} from "@/lib/types";
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
import { readThreeMFRegions } from "@/lib/three-mf-loader";
import { useAdminColors } from "@/lib/use-colors";

// three.js is heavy and only needed once a 3MF file is dropped
const PreviewRoom = dynamic(() => import("@/components/ui/custom/preview-room"), { ssr: false });

// ── Field type constants ───────────────────────────────────────────────
const FIELD_TYPES = {
	RADIO_GROUP: "radio-group",
	CHECKLIST: "dropdown",
	THREE_MF_COLOR_PICKER: "three-mf",
} as const;

type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
	"radio-group": "Radio Group",
	dropdown: "Checklist / Dropdown",
	"three-mf": "Color Picker (3MF)",
};

// 3MF color pickers always use these; the inputs show them greyed out
const THREE_MF_LABEL = "Colors";
const THREE_MF_DESCRIPTION = "Pick a color for each part of the print.";

// ── Option row shapes ──────────────────────────────────────────────────
type DropdownOption = { label: string; price: string };

const emptyDropdownOption = (): DropdownOption => ({ label: "", price: "" });

const toThreeMFOption = (color: Color): UnsavedInventoryItemFieldOptionsThreeMFColorRegion => ({
	label: color.name,
	price: 0,
	selectedColor: color,
});

/**
 * A field as the item dialog holds it before saving. 3MF regions have no ids
 * yet and the file is uploaded on item submit, which fills in threeMFUrl.
 */
export type InventoryItemFieldDraft = Omit<InventoryItemField, "regions"> & {
	regions?: UnsavedInventoryItemFieldThreeMFRegion[];
	_threeMFFile?: File;
};

// ── Props ──────────────────────────────────────────────────────────────
type InventoryItemFieldDialogProps = {
	trigger?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Called with the new field, in the shape it will be stored in. */
	onFieldCreated?: (field: InventoryItemFieldDraft) => void;
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
	const [threeMFFile, setThreeMFFile] = useState<File[]>([]);
	const [regions, setRegions] = useState<UnsavedInventoryItemFieldThreeMFRegion[]>([]);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const { data: allColors = [] } = useAdminColors();
	const palette = allColors.filter((c) => !c.isDisabled);

	const isThreeMF = fieldType === FIELD_TYPES.THREE_MF_COLOR_PICKER;
	const fieldLabel = isThreeMF ? THREE_MF_LABEL : label;
	const fieldDescription = isThreeMF ? THREE_MF_DESCRIPTION : description;

	const isValid =
		fieldLabel.trim().length > 0 &&
		fieldDescription.trim().length > 0 &&
		(isThreeMF
			? threeMFFile.length > 0 &&
				regions.length > 0 &&
				regions.every((r) => r.name.trim().length > 0 && r.options.length > 0 && r.options.every((o) => o.price >= 0))
			: dropdownOptions.length > 0 &&
				dropdownOptions.every((opt) => opt.label.trim().length > 0 && opt.price !== "" && !isNaN(Number(opt.price)) && Number(opt.price) >= 0));

	// The preview loads the dropped file from a blob URL; free it when replaced
	useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	async function handleThreeMFFile(files: File[]) {
		setThreeMFFile(files);
		setRegions([]);
		setPreviewUrl(null);
		const file = files[0];
		if (!file) return;
		if (palette.length === 0) toast.warning("No printing colors yet - add some from the dashboard first");
		try {
			setRegions(readThreeMFRegions(await file.arrayBuffer(), palette));
			setPreviewUrl(URL.createObjectURL(file));
		} catch (err) {
			setThreeMFFile([]);
			toast.error((err as Error).message);
		}
	}

	function resetForm() {
		setFieldType(FIELD_TYPES.RADIO_GROUP);
		setLabel("");
		setDescription("");
		setDropdownOptions([emptyDropdownOption()]);
		setThreeMFFile([]);
		setRegions([]);
		setPreviewUrl(null);
	}

	// ── option helpers ──────────────────────────────────────────────────
	function addOption() {
		setDropdownOptions((prev) => [...prev, emptyDropdownOption()]);
	}

	function removeOption(index: number) {
		setDropdownOptions((prev) => prev.filter((_, i) => i !== index));
	}

	function updateDropdownOption(index: number, key: keyof DropdownOption, value: string) {
		setDropdownOptions((prev) =>
			prev.map((opt, i) => (i === index ? { ...opt, [key]: value } : opt)),
		);
	}

	// ── 3MF region helpers ──────────────────────────────────────────────
	function updateRegion(slotIndex: number, update: (r: UnsavedInventoryItemFieldThreeMFRegion) => UnsavedInventoryItemFieldThreeMFRegion) {
		setRegions((prev) => prev.map((r) => (r.slotIndex === slotIndex ? update(r) : r)));
	}

	function updateRegionOptions(
		slotIndex: number,
		update: (options: UnsavedInventoryItemFieldOptionsThreeMFColorRegion[]) => UnsavedInventoryItemFieldOptionsThreeMFColorRegion[],
	) {
		updateRegion(slotIndex, (r) => ({ ...r, options: update(r.options) }));
	}

	// ── submit ──────────────────────────────────────────────────────────
	function handleSubmit(e: { preventDefault: () => void; stopPropagation: () => void }) {
		e.preventDefault();
		e.stopPropagation();

		if (!fieldLabel.trim()) {
			toast.error("Field label is required");
			return;
		}
		if (!fieldDescription.trim()) {
			toast.error("Field description is required");
			return;
		}
		if (isThreeMF) {
			if (threeMFFile.length === 0) {
				toast.error("A 3MF file is required for color picker fields");
				return;
			}
			const unnamed = regions.find((r) => !r.name.trim());
			if (unnamed) {
				toast.error(`Region in slot ${unnamed.slotIndex} needs a name`);
				return;
			}
			const colorless = regions.find((r) => r.options.length === 0);
			if (colorless) {
				toast.error(`${colorless.name} needs at least one color`);
				return;
			}
		} else {
			if (dropdownOptions.length === 0) {
				toast.error("At least one option is required");
				return;
			}
			for (const opt of dropdownOptions) {
				if (!opt.label.trim()) {
					toast.error("All options must have a label");
					return;
				}
				if (opt.price === "" || isNaN(Number(opt.price)) || Number(opt.price) < 0) {
					toast.error("All options must have a valid price");
					return;
				}
			}
		}

		const field: InventoryItemFieldDraft = isThreeMF
			? {
					id: 0,
					label: fieldLabel,
					description: fieldDescription,
					field_type: "three_mf_color_picker",
					regions: regions.map((r) => ({ ...r, name: r.name.trim() })),
					options: [],
					_threeMFFile: threeMFFile[0],
				}
			: {
					id: 0,
					label: fieldLabel,
					description: fieldDescription,
					field_type: fieldType === FIELD_TYPES.RADIO_GROUP ? "radio_group" : "checklist",
					options: dropdownOptions.map((opt) => ({ id: 0, label: opt.label, price: Number(opt.price) })),
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
								{fieldType === FIELD_TYPES.THREE_MF_COLOR_PICKER && "Customers pick a color for each region of a 3D-printed part."}
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
								value={fieldLabel}
								disabled={isThreeMF}
								onChange={(e) => setLabel(e.target.value)}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="fieldDescription">Description</FieldLabel>
							<Input
								id="fieldDescription"
								placeholder="Brief description of this field"
								value={fieldDescription}
								disabled={isThreeMF}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</Field>
					</div>

					{/* ── 3MF file + generated regions ───────────────────────── */}
					{isThreeMF && (
						<>
							<Field>
								<FieldLabel>3MF File</FieldLabel>
								<FieldDescription>
									Each color slot in the file becomes a region customers pick a color for.
								</FieldDescription>
								<ImageDropField
									name="threeMFFile"
									value={threeMFFile}
									onChange={handleThreeMFFile}
									maxFiles={1}
									accept={{
										"model/3mf": [".3mf"],
										"application/vnd.ms-package.3dmanufacturing-3dmodel+xml": [".3mf"],
										"application/octet-stream": [".3mf"],
									}}
								/>
							</Field>

							{previewUrl && (
								<div className="h-64 overflow-hidden rounded-md border bg-muted">
									<PreviewRoom
										url={previewUrl}
										slotColors={Object.fromEntries(
											regions.filter((r) => r.options[0]).map((r) => [r.slotIndex, r.options[0].selectedColor.hex]),
										)}
									/>
								</div>
							)}

							{regions.map((region) => {
								const offered = new Set(region.options.map((o) => o.selectedColor.id));
								const addable = palette.filter((c) => !offered.has(c.id));
								return (
									<div key={region.slotIndex} className="flex flex-col gap-3 rounded-md border p-3">
										<div className="flex items-center gap-3">
											<span className="shrink-0 text-xs text-muted-foreground">Slot {region.slotIndex}</span>
											<Input
												aria-label="Region name"
												placeholder="Region name"
												value={region.name}
												onChange={(e) => updateRegion(region.slotIndex, (r) => ({ ...r, name: e.target.value }))}
											/>
										</div>

										<div className="grid grid-cols-[16px_1fr_90px_32px] items-center gap-2 text-xs font-medium text-muted-foreground">
											<span />
											<span>Color</span>
											<span>Price ($)</span>
											<span />
										</div>
										{region.options.map((opt, i) => (
											<div key={opt.selectedColor.id} className="grid grid-cols-[16px_1fr_90px_32px] items-center gap-2">
												<span className="size-4 rounded-full border" style={{ backgroundColor: opt.selectedColor.hex }} />
												<span className="truncate text-sm">{opt.label}</span>
												<Input
													type="number"
													min={0}
													step={1}
													value={opt.price}
													onChange={(e) =>
														updateRegionOptions(region.slotIndex, (options) =>
															options.map((o, j) => (j === i ? { ...o, price: Math.max(0, Number(e.target.value) || 0) } : o)),
														)
													}
												/>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => updateRegionOptions(region.slotIndex, (options) => options.filter((_, j) => j !== i))}
												>
													<Trash2 className="size-4" />
												</Button>
											</div>
										))}

										{addable.length > 0 && (
											<Select
												value=""
												onValueChange={(id) => {
													const color = palette.find((c) => String(c.id) === id);
													if (color) updateRegionOptions(region.slotIndex, (options) => [...options, toThreeMFOption(color)]);
												}}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Add a color" />
												</SelectTrigger>
												<SelectContent>
													{addable.map((c) => (
														<SelectItem key={c.id} value={String(c.id)}>
															<span className="flex items-center gap-2">
																<span className="inline-block size-3 rounded-full border" style={{ backgroundColor: c.hex }} />
																{c.name}
															</span>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									</div>
								);
							})}
						</>
					)}

					{/* ── Options ─────────────────────────────────────────────── */}
					{!isThreeMF && (
						<div className="flex flex-col gap-3">
							<div className="flex items-center justify-between">
								<FieldLabel>Options</FieldLabel>
								<Button type="button" variant="outline" size="sm" onClick={addOption}>
									<Plus className="mr-1 size-4" />
									Add Option
								</Button>
							</div>

							{/* Column headers */}
							<div className="grid grid-cols-[1fr_100px_32px] gap-2 text-xs font-medium text-muted-foreground">
								<span>Label</span>
								<span>Price ($)</span>
								<span />
							</div>

							{dropdownOptions.map((opt, i) => (
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
						</div>
					)}
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
