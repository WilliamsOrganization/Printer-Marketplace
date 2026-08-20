"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ImageDropField } from "@/components/ui/custom/image-drop-field";
import {
	InventoryItem,
	SizeCategory,
	SizeCategoryLabel,
	WeightCategory,
	WeightCategoryLabel,
} from "@/lib/types";
import api from "@/lib/api";
import { useDashboard } from "@/src/context/dashboard-context";
import { NumericFormat } from "react-number-format";

const CURRENCIES = Intl.supportedValuesOf("currency");

const formSchema = z.object({
	itemTitle: z.string().min(1, "Item title is required"),
	itemDescription: z.string().min(1, "Item description is required"),
	itemCost: z.number().positive("Item cost must be positive"),
	quantity: z.number().int().positive("Quantity must be a positive number"),
	image: z.array(z.instanceof(File)),
	currency: z.string().length(3, "Currency must be a 3-letter code (e.g. CAD)"),
	sale: z.boolean(),
	sizeCategory: z.nativeEnum(SizeCategory),
	weightCategory: z.nativeEnum(WeightCategory),
});

type FormValues = z.infer<typeof formSchema>;

type InventoryItemDialogProps = {
	/** Item to edit. Omit to create a new item instead. */
	item?: InventoryItem;
	/** Omit when the open state is controlled externally (e.g. from a dropdown menu item). */
	trigger?: React.ReactNode;
	/** Controlled open state - lets a caller open this outside of its own DialogTrigger
	 * (e.g. a DropdownMenuItem, where nesting the Dialog's trigger inside the menu item
	 * breaks pointer events after the menu closes). Falls back to internal state if omitted. */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

/**
 * Single create/edit form for inventory items, shared by both flows so a
 * schema change only needs to happen in one place. In edit mode it's
 * pre-populated from `item`; in create mode it starts blank. Either way it
 * submits to the same POST /inventoryitem upsert endpoint - the backend
 * decides create vs. update based on whether an id is present.
 */
export function InventoryItemDialog({ item, trigger, open: controlledOpen, onOpenChange }: InventoryItemDialogProps) {
	const isEditing = item !== undefined;
	const { setInventory } = useDashboard();
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	const open = controlledOpen ?? uncontrolledOpen;
	const setOpen = onOpenChange ?? setUncontrolledOpen;
	const [existingImageUrls, setExistingImageUrls] = useState<string[]>(item?.imageUrls ?? []);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			itemTitle: item?.itemTitle ?? "",
			itemDescription: item?.itemDescription ?? "",
			itemCost: item?.itemCost ?? 0,
			quantity: item?.quantity ?? 1,
			image: [],
			currency: item?.currency ?? "CAD",
			sale: item?.sale ?? false,
			sizeCategory: item?.sizeCategory ?? SizeCategory.SIZE_4X5,
			weightCategory: item?.weightCategory ?? WeightCategory.MEDIUM,
		},
	});

	// TODO: needs to support the ability to create multiple pricing tiers for the product. (expensive vs non expensive)
	async function onSubmit(data: FormValues) {
		let imageUrls = existingImageUrls;
		if (data.image.length > 0) {
			const multiFormData = new FormData();
			data.image.forEach((file) => multiFormData.append("images", file));
			const uploadRes = await api
				.post<string[]>("/inventoryitem/images", multiFormData, {
					headers: { "Content-Type": "multipart/form-data" },
				})
				.catch((err) => {
					toast.error("Error Uploading Images: " + err.message);
					return null;
				});
			if (!uploadRes) return;
			imageUrls = uploadRes.data;
		}

		api
			.post<InventoryItem>("/inventoryitem", {
				...(isEditing ? { id: item.id } : {}),
				...data,
				imageUrls,
				image: undefined,
			})
			.then((res) => {
				toast.success(isEditing ? "Inventory Item Updated" : "Inventory Item Created");
				setInventory((prev) =>
					isEditing
						? prev.map((i) => (i.id === item.id ? res.data : i))
						: [...prev, res.data],
				);
				setOpen(false);
				form.reset();
			})
			.catch(() => {
				toast.error(isEditing ? "Failed to update item" : "Inventory Item Not Created");
			});
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent className="sm:max-w-2xl" onKeyDown={(e) => e.stopPropagation()}>
				<DialogHeader>
					<DialogTitle>{isEditing ? "Edit Inventory Item" : "Create Inventory Item"}</DialogTitle>
					<DialogDescription>
						{isEditing ? (
							<>Update the details for <strong>{item.itemTitle}</strong>.</>
						) : (
							"Add a new item to your inventory."
						)}
					</DialogDescription>
				</DialogHeader>
				<form id="inventory-item-form" onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex flex-col gap-6">
						<div className="grid grid-cols-2 gap-6">
							<FieldGroup>
								<Controller
									name="itemTitle"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="itemTitle">Item Title</FieldLabel>
											<Input id="itemTitle" placeholder="Enter item title" {...field} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
								<Controller
									name="itemDescription"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="itemDescription">Item Description</FieldLabel>
											<Input id="itemDescription" placeholder="Enter item description" {...field} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
								<Controller
									name="itemCost"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="itemCost">Item Cost</FieldLabel>
											<NumericFormat
												id="itemCost"
												defaultValue={item?.itemCost ?? 0}
												allowNegative={false}
												decimalScale={2}
												fixedDecimalScale
												onValueChange={(values) => field.onChange(values.floatValue ?? 0)}
												customInput={Input}
											/>
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
								<Controller
									name="quantity"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="quantity">Quantity</FieldLabel>
											<NumericFormat
												id="quantity"
												defaultValue={item?.quantity ?? 1}
												allowNegative={false}
												decimalScale={0}
												onValueChange={(values) => field.onChange(values.floatValue ?? 1)}
												customInput={Input}
											/>
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
							</FieldGroup>
							<FieldGroup>
								<Controller
									name="currency"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="currency">Currency</FieldLabel>
											<Select value={field.value} onValueChange={field.onChange}>
												<SelectTrigger id="currency" className="w-full">
													<SelectValue placeholder="Select currency" />
												</SelectTrigger>
												<SelectContent>
													{CURRENCIES.map((code) => (
														<SelectItem key={code} value={code}>
															{code}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
								<Controller
									name="sizeCategory"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="sizeCategory">Package Size</FieldLabel>
											<Select value={field.value} onValueChange={field.onChange}>
												<SelectTrigger id="sizeCategory" className="w-full">
													<SelectValue placeholder="Select a size" />
												</SelectTrigger>
												<SelectContent>
													{Object.values(SizeCategory).map((size) => (
														<SelectItem key={size} value={size}>
															{SizeCategoryLabel[size]}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FieldDescription>Used to estimate a combined shipping parcel at checkout.</FieldDescription>
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
								<Controller
									name="weightCategory"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="weightCategory">Package Weight</FieldLabel>
											<Select value={field.value} onValueChange={field.onChange}>
												<SelectTrigger id="weightCategory" className="w-full">
													<SelectValue placeholder="Select a weight" />
												</SelectTrigger>
												<SelectContent>
													{Object.values(WeightCategory).map((weight) => (
														<SelectItem key={weight} value={weight}>
															{WeightCategoryLabel[weight]}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
								<Controller
									name="sale"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field orientation="horizontal" data-invalid={fieldState.invalid}>
											<FieldContent>
												<FieldLabel htmlFor="sale">On Sale</FieldLabel>
												<FieldDescription>Mark this item as currently on sale</FieldDescription>
											</FieldContent>
											<Switch
												id="sale"
												name={field.name}
												checked={field.value}
												onCheckedChange={field.onChange}
												aria-invalid={fieldState.invalid}
											/>
										</Field>
									)}
								/>
							</FieldGroup>
						</div>
						<FieldGroup>
							<Controller
								name="image"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel>
											{isEditing ? "Images" : "Image"}
										</FieldLabel>
										{isEditing && existingImageUrls.length > 0 && (
											<div className="flex gap-2">
												{existingImageUrls.map((url) => (
													<div key={url} className="group relative size-14">
														{/* eslint-disable-next-line @next/next/no-img-element */}
														<img
															src={url}
															alt=""
															className="size-14 rounded-md border object-cover"
														/>
														<button
															type="button"
															onClick={() =>
																setExistingImageUrls((prev) => prev.filter((u) => u !== url))
															}
															className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
														>
															<span className="sr-only">Remove image</span>
															×
														</button>
													</div>
												))}
											</div>
										)}
										{isEditing && (
											<FieldDescription>
												Click × to remove an image. Dropping new ones below replaces all of them.
											</FieldDescription>
										)}
										<ImageDropField name={field.name} value={field.value} onChange={field.onChange} maxFiles={5} />
										{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
									</Field>
								)}
							/>
						</FieldGroup>
					</div>
				</form>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button type="submit" form="inventory-item-form">
						{isEditing ? "Save Changes" : "Create Item"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default InventoryItemDialog;
