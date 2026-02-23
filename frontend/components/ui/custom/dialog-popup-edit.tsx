"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
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
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
	FieldTitle,
} from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { NumericFormat } from "react-number-format";
import { Category, ItemBadge } from "@/lib/types";
import api from "@/lib/api";
import { useDashboard } from "@/src/context/dashboard-context";

const CURRENCIES = Intl.supportedValuesOf("currency");

const formSchema = z.object({
	itemTitle: z.string().min(1, "Item title is required"),
	itemDescription: z.string().min(1, "Item description is required"),
	itemCost: z.number().positive("Item cost must be positive"),
	quantity: z.number().int().positive("Quantity must be a positive number"),
	currency: z.string().length(3, "Currency must be a 3-letter code (e.g. CAD)"),
	sale: z.boolean(),
	category: z.nativeEnum(Category),
	badge: z.nativeEnum(ItemBadge),
});

type FormValues = z.infer<typeof formSchema>;

type EditInventoryProps = {
	item: {
		id: number;
		itemTitle: string;
		itemDescription: string;
		itemCost: number;
		quantity: number;
		currency: string;
		category: string;
		badge?: string | null;
	};
};

export function EditInventory({ item }: EditInventoryProps) {
	const { setInventory } = useDashboard();
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			itemTitle: item.itemTitle,
			itemDescription: item.itemDescription,
			itemCost: item.itemCost,
			quantity: item.quantity,
			currency: item.currency ?? "CAD",
			sale: false,
			category: item.category as Category,
			badge: (item.badge ?? ItemBadge.NEW) as ItemBadge,
		},
	});

	function onSubmit(data: FormValues) {
		api
			.put(`/inventoryitem/${item.id}`, data)
			.then(() => {
				toast.success("Inventory Item Updated");
				setInventory(prev => prev.map(i =>
					i.id === item.id ? { ...i, ...data } : i
				));
			})
			.catch(() => {
				toast.error("Failed to update item");
			});
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<span className="w-full cursor-default">Edit</span>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg" onKeyDown={(e) => e.stopPropagation()}>
				<DialogHeader>
					<DialogTitle>Edit Inventory Item</DialogTitle>
					<DialogDescription>
						Update the details for <strong>{item.itemTitle}</strong>.
					</DialogDescription>
				</DialogHeader>
				<form id="edit-inventory-form" onSubmit={form.handleSubmit(onSubmit)}>
					<div className="grid grid-cols-2 gap-6">
						<FieldGroup>
							<Controller
								name="itemTitle"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="edit-itemTitle">Item Title</FieldLabel>
										<Input
											id="edit-itemTitle"
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
										<FieldLabel htmlFor="edit-itemDescription">
											Item Description
										</FieldLabel>
										<Input
											id="edit-itemDescription"
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
										<FieldLabel htmlFor="edit-itemCost">Item Cost</FieldLabel>
										<NumericFormat
											id="edit-itemCost"
											defaultValue={item.itemCost}
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
										<FieldLabel htmlFor="edit-quantity">Quantity</FieldLabel>
										<NumericFormat
											id="edit-quantity"
											defaultValue={item.quantity}
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
								name="currency"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="edit-currency">Currency</FieldLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger id="edit-currency" className="w-full">
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
											<FieldLabel htmlFor="edit-sale">On Sale</FieldLabel>
											<FieldDescription>
												Mark this item as currently on sale
											</FieldDescription>
										</FieldContent>
										<Switch
											id="edit-sale"
											name={field.name}
											checked={field.value}
											onCheckedChange={field.onChange}
											aria-invalid={fieldState.invalid}
										/>
									</Field>
								)}
							/>
						</FieldGroup>

						<FieldGroup>
							<Controller
								name="category"
								control={form.control}
								render={({ field, fieldState }) => (
									<FieldSet data-invalid={fieldState.invalid}>
										<FieldLegend variant="label">Category</FieldLegend>
										<RadioGroup
											name={field.name}
											value={field.value}
											onValueChange={field.onChange}
										>
											<FieldLabel htmlFor="edit-category-electronics">
												<Field orientation="horizontal">
													<FieldContent>
														<FieldTitle>Electronics</FieldTitle>
													</FieldContent>
													<RadioGroupItem
														value={Category.ELECTRONICS}
														id="edit-category-electronics"
													/>
												</Field>
											</FieldLabel>
											<FieldLabel htmlFor="edit-category-prints">
												<Field orientation="horizontal">
													<FieldContent>
														<FieldTitle>Prints</FieldTitle>
													</FieldContent>
													<RadioGroupItem
														value={Category.PRINTS}
														id="edit-category-prints"
													/>
												</Field>
											</FieldLabel>
											<FieldLabel htmlFor="edit-category-custom">
												<Field orientation="horizontal">
													<FieldContent>
														<FieldTitle>Custom</FieldTitle>
													</FieldContent>
													<RadioGroupItem
														value={Category.CUSTOM}
														id="edit-category-custom"
													/>
												</Field>
											</FieldLabel>
										</RadioGroup>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</FieldSet>
								)}
							/>
							<Controller
								name="badge"
								control={form.control}
								render={({ field, fieldState }) => (
									<FieldSet data-invalid={fieldState.invalid}>
										<FieldLegend variant="label">Badge</FieldLegend>
										<RadioGroup
											name={field.name}
											value={field.value}
											onValueChange={field.onChange}
										>
											<FieldLabel htmlFor="edit-badge-bestseller">
												<Field orientation="horizontal">
													<FieldContent>
														<FieldTitle>Bestseller</FieldTitle>
													</FieldContent>
													<RadioGroupItem
														value={ItemBadge.BESTSELLER}
														id="edit-badge-bestseller"
													/>
												</Field>
											</FieldLabel>
											<FieldLabel htmlFor="edit-badge-new">
												<Field orientation="horizontal">
													<FieldContent>
														<FieldTitle>New</FieldTitle>
													</FieldContent>
													<RadioGroupItem
														value={ItemBadge.NEW}
														id="edit-badge-new"
													/>
												</Field>
											</FieldLabel>
											<FieldLabel htmlFor="edit-badge-sale">
												<Field orientation="horizontal">
													<FieldContent>
														<FieldTitle>Sale</FieldTitle>
													</FieldContent>
													<RadioGroupItem
														value={ItemBadge.SALE}
														id="edit-badge-sale"
													/>
												</Field>
											</FieldLabel>
										</RadioGroup>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
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
					<Button type="submit" form="edit-inventory-form">
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default EditInventory;
