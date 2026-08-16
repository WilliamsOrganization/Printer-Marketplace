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
	FieldLegend,
	FieldSet,
	FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ImageDropField } from "@/components/ui/drag-drop";
import { Category, InventoryItem, ItemBadge } from "@/lib/types";
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
	category: z.nativeEnum(Category),
	badge: z.nativeEnum(ItemBadge),
});

type FormValues = z.infer<typeof formSchema>;

type InventoryItemDialogProps = {
	/** Item to edit. Omit to create a new item instead. */
	item?: InventoryItem;
	trigger: React.ReactNode;
};

/**
 * Single create/edit form for inventory items, shared by both flows so a
 * schema change only needs to happen in one place. In edit mode it's
 * pre-populated from `item`; in create mode it starts blank. Either way it
 * submits to the same POST /inventoryitem upsert endpoint - the backend
 * decides create vs. update based on whether an id is present.
 */
export function InventoryItemDialog({ item, trigger }: InventoryItemDialogProps) {
	const isEditing = item !== undefined;
	const { setInventory } = useDashboard();
	const [open, setOpen] = useState(false);
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
			category: item?.category ?? Category.ELECTRONICS,
			badge: item?.badge ?? ItemBadge.NEW,
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
			<DialogTrigger asChild>{trigger}</DialogTrigger>
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
					<div className="grid grid-cols-2 gap-6">
						{/* Left column - Input fields */}
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
										<ImageDropField name={field.name} value={field.value} onChange={field.onChange} />
										{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
									</Field>
								)}
							/>
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

						{/* Right column - Radio groups */}
						<FieldGroup>
							<Controller
								name="category"
								control={form.control}
								render={({ field, fieldState }) => (
									<FieldSet data-invalid={fieldState.invalid}>
										<FieldLegend variant="label">Category</FieldLegend>
										<FieldDescription>Select the item category.</FieldDescription>
										<RadioGroup name={field.name} value={field.value} onValueChange={field.onChange}>
											<FieldLabel htmlFor="category-electronics">
												<Field orientation="horizontal">
													<FieldContent>
														<FieldTitle>Electronics</FieldTitle>
														<FieldDescription>Electronic devices and accessories</FieldDescription>
													</FieldContent>
													<RadioGroupItem value={Category.ELECTRONICS} id="category-electronics" />
												</Field>
											</FieldLabel>
											<FieldLabel htmlFor="category-prints">
												<Field orientation="horizontal">
													<FieldContent>
														<FieldTitle>Prints</FieldTitle>
														<FieldDescription>Printed materials and artwork</FieldDescription>
													</FieldContent>
													<RadioGroupItem value={Category.PRINTS} id="category-prints" />
												</Field>
											</FieldLabel>
											<FieldLabel htmlFor="category-custom">
												<Field orientation="horizontal">
													<FieldContent>
														<FieldTitle>Custom</FieldTitle>
														<FieldDescription>Custom made items</FieldDescription>
													</FieldContent>
													<RadioGroupItem value={Category.CUSTOM} id="category-custom" />
												</Field>
											</FieldLabel>
										</RadioGroup>
										{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
									</FieldSet>
								)}
							/>
							<Controller
								name="badge"
								control={form.control}
								render={({ field, fieldState }) => (
									<FieldSet data-invalid={fieldState.invalid}>
										<FieldLegend variant="label">Badge</FieldLegend>
										<FieldDescription>Select a badge for this item.</FieldDescription>
										<RadioGroup name={field.name} value={field.value} onValueChange={field.onChange}>
											<FieldLabel htmlFor="badge-bestseller">
												<Field orientation="horizontal">
													<FieldContent>
														<FieldTitle>Bestseller</FieldTitle>
														<FieldDescription>Mark as a top selling item</FieldDescription>
													</FieldContent>
													<RadioGroupItem value={ItemBadge.BESTSELLER} id="badge-bestseller" />
												</Field>
											</FieldLabel>
											<FieldLabel htmlFor="badge-new">
												<Field orientation="horizontal">
													<FieldContent>
														<FieldTitle>New</FieldTitle>
														<FieldDescription>Recently added item</FieldDescription>
													</FieldContent>
													<RadioGroupItem value={ItemBadge.NEW} id="badge-new" />
												</Field>
											</FieldLabel>
											<FieldLabel htmlFor="badge-sale">
												<Field orientation="horizontal">
													<FieldContent>
														<FieldTitle>Sale</FieldTitle>
														<FieldDescription>Item is on sale</FieldDescription>
													</FieldContent>
													<RadioGroupItem value={ItemBadge.SALE} id="badge-sale" />
												</Field>
											</FieldLabel>
										</RadioGroup>
										{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
									</FieldSet>
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
