"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { Category, ItemBadge } from "@/lib/types";
import { ImageDropField } from "./drag-drop";
import api from "@/lib/api";
import { NumericFormat } from "react-number-format";

const CURRENCIES = Intl.supportedValuesOf("currency");

const formSchema = z.object({
	itemTitle: z.string().min(0, "Item title is required"),
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

export function CreateInventoryItemForm() {
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			itemTitle: "",
			itemDescription: "",
			itemCost: 0,
			quantity: 1,
			image: [],
			currency: "CAD",
			sale: false,
			category: Category.ELECTRONICS,
			badge: ItemBadge.NEW,
		},
	});

	function onSubmit(data: FormValues) {
		// TODO: Upload images, then POST to /server/inventoryitem
		api
			.post("/inventoryitem", data)
			.then(() => {
				toast.success("Inventory Item Created");
				form.reset();
			})
			.catch(() => {
				toast.error("Inventory Item Not Created");
			});
	}

	return (
		<Card className="w-full max-w-2xl">
			<CardHeader className="border-b">
				<CardTitle>Create Inventory Item</CardTitle>
				<CardDescription>Add a new item to your inventory.</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id="create-inventory-item-form"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="grid grid-cols-2 gap-6">
						{/* Left column - Input fields */}
						<FieldGroup>
							<Controller
								name="itemTitle"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="itemTitle">Item Title</FieldLabel>
										<Input
											id="itemTitle"
											placeholder="Enter item title"
											{...field}
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<Controller
								name="itemDescription"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="itemDescription">
											Item Description
										</FieldLabel>
										<Input
											id="itemDescription"
											placeholder="Enter item description"
											{...field}
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
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
											defaultValue={0.0}
											allowNegative={false}
											decimalScale={2}
											fixedDecimalScale
											onValueChange={(values) =>
												field.onChange(values.floatValue ?? 0)
											}
											customInput={Input}
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
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
											defaultValue={1}
											allowNegative={false}
											decimalScale={0}
											onValueChange={(values) =>
												field.onChange(values.floatValue ?? 1)
											}
											customInput={Input}
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<Controller
								name="image"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel>Image</FieldLabel>
										<ImageDropField
											name={field.name}
											value={field.value}
											onChange={field.onChange}
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
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
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<Controller
								name="sale"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field
										orientation="horizontal"
										data-invalid={fieldState.invalid}
									>
										<FieldContent>
											<FieldLabel htmlFor="sale">On Sale</FieldLabel>
											<FieldDescription>
												Mark this item as currently on sale
											</FieldDescription>
										</FieldContent>
										<Switch
											id="sale"
											name={field.name}
											checked={field.value}
											onCheckedChange={field.onChange}
											aria-invalid={fieldState.invalid}
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
						</FieldGroup>

						{/* Right column - Radio groups */}
						<FieldGroup>
							<Controller
								name="category"
								control={form.control}
								render={({ field, fieldState }) => {
									const isInvalid = fieldState.invalid;
									return (
										<FieldSet data-invalid={isInvalid}>
											<FieldLegend variant="label">Category</FieldLegend>
											<FieldDescription>
												Select the item category.
											</FieldDescription>
											<RadioGroup
												name={field.name}
												value={field.value}
												onValueChange={field.onChange}
												aria-invalid={isInvalid}
											>
												<FieldLabel htmlFor="category-electronics">
													<Field orientation="horizontal">
														<FieldContent>
															<FieldTitle>Electronics</FieldTitle>
															<FieldDescription>
																Electronic devices and accessories
															</FieldDescription>
														</FieldContent>
														<RadioGroupItem
															value={Category.ELECTRONICS}
															id="category-electronics"
														/>
													</Field>
												</FieldLabel>
												<FieldLabel htmlFor="category-prints">
													<Field orientation="horizontal">
														<FieldContent>
															<FieldTitle>Prints</FieldTitle>
															<FieldDescription>
																Printed materials and artwork
															</FieldDescription>
														</FieldContent>
														<RadioGroupItem
															value={Category.PRINTS}
															id="category-prints"
														/>
													</Field>
												</FieldLabel>
												<FieldLabel htmlFor="category-custom">
													<Field orientation="horizontal">
														<FieldContent>
															<FieldTitle>Custom</FieldTitle>
															<FieldDescription>
																Custom made items
															</FieldDescription>
														</FieldContent>
														<RadioGroupItem
															value={Category.CUSTOM}
															id="category-custom"
														/>
													</Field>
												</FieldLabel>
											</RadioGroup>
											{isInvalid && <FieldError errors={[fieldState.error]} />}
										</FieldSet>
									);
								}}
							/>
							<Controller
								name="badge"
								control={form.control}
								render={({ field, fieldState }) => {
									const isInvalid = fieldState.invalid;
									return (
										<FieldSet data-invalid={isInvalid}>
											<FieldLegend variant="label">Badge</FieldLegend>
											<FieldDescription>
												Select a badge for this item.
											</FieldDescription>
											<RadioGroup
												name={field.name}
												value={field.value}
												onValueChange={field.onChange}
												aria-invalid={isInvalid}
											>
												<FieldLabel htmlFor="badge-bestseller">
													<Field orientation="horizontal">
														<FieldContent>
															<FieldTitle>Bestseller</FieldTitle>
															<FieldDescription>
																Mark as a top selling item
															</FieldDescription>
														</FieldContent>
														<RadioGroupItem
															value={ItemBadge.BESTSELLER}
															id="badge-bestseller"
														/>
													</Field>
												</FieldLabel>
												<FieldLabel htmlFor="badge-new">
													<Field orientation="horizontal">
														<FieldContent>
															<FieldTitle>New</FieldTitle>
															<FieldDescription>
																Recently added item
															</FieldDescription>
														</FieldContent>
														<RadioGroupItem
															value={ItemBadge.NEW}
															id="badge-new"
														/>
													</Field>
												</FieldLabel>
												<FieldLabel htmlFor="badge-sale">
													<Field orientation="horizontal">
														<FieldContent>
															<FieldTitle>Sale</FieldTitle>
															<FieldDescription>
																Item is on sale
															</FieldDescription>
														</FieldContent>
														<RadioGroupItem
															value={ItemBadge.SALE}
															id="badge-sale"
														/>
													</Field>
												</FieldLabel>
											</RadioGroup>
											{isInvalid && <FieldError errors={[fieldState.error]} />}
										</FieldSet>
									);
								}}
							/>
						</FieldGroup>
					</div>
				</form>
			</CardContent>
			<CardFooter className="border-t">
				<Field>
					<Button type="submit" form="create-inventory-item-form">
						Create Item
					</Button>
					<Button type="button" variant="outline" onClick={() => form.reset()}>
						Reset
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
}
