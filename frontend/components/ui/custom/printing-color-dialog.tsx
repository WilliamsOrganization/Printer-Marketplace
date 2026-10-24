"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { HexColorInput, HexColorPicker } from "react-colorful";

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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { COLORS_QUERY_KEY } from "@/lib/use-colors";
import { nameColor } from "@/lib/color-names";

// Mirrors ColorService on the backend: a name and an #RRGGBB hex.
const formSchema = z.object({
	name: z.string().trim().min(1, "Color name is required"),
	hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Hex must look like #RRGGBB"),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Creates a printing color (POST /colors) that 3MF regions can then be
 * offered in. The name follows the picked color automatically until the
 * admin types their own.
 */
export function PrintingColorDialog({ trigger }: { trigger: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { name: "", hex: "#000000" },
	});

	// Stops auto-naming once the admin types a name of their own
	const [nameEdited, setNameEdited] = useState(false);
	const hex = useWatch({ control: form.control, name: "hex" });

	useEffect(() => {
		if (!open || nameEdited || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return;
		let stale = false;
		nameColor(hex).then((name) => {
			// A newer color may have been picked while this one was being named
			if (!stale) form.setValue("name", name, { shouldValidate: form.formState.isSubmitted });
		});
		return () => {
			stale = true;
		};
	}, [hex, open, nameEdited, form]);

	async function onSubmit(data: FormValues) {
		try {
			await api.post("/colors", data);
			toast.success(`Added ${data.name}`);
			queryClient.invalidateQueries({ queryKey: COLORS_QUERY_KEY });
			form.reset();
			setNameEdited(false);
			setOpen(false);
		} catch (err) {
			// The backend sends the reason (e.g. a bad hex) as the 400 body
			const reason = isAxiosError(err) && typeof err.response?.data === "string" ? err.response.data : null;
			toast.error(reason ?? "Failed to add color");
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="sm:max-w-md" onKeyDown={(e) => e.stopPropagation()}>
				<DialogHeader>
					<DialogTitle>Add Printing Color</DialogTitle>
					<DialogDescription>Add a filament color that 3MF regions can be printed in.</DialogDescription>
				</DialogHeader>
				<form id="printing-color-form" onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<Controller
							name="hex"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="colorHex">Color</FieldLabel>
									<HexColorPicker
										color={field.value}
										onChange={(value) => field.onChange(value.toUpperCase())}
										style={{ width: "100%" }}
									/>
									<div className="flex items-center gap-2">
										<span
											className="size-9 shrink-0 rounded-md border shadow-xs"
											style={{ backgroundColor: field.value }}
										/>
										<HexColorInput
											id="colorHex"
											prefixed
											color={field.value}
											onChange={(value) => field.onChange(value.toUpperCase())}
											className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 py-1 font-mono text-sm uppercase shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
										/>
									</div>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
						<Controller
							name="name"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="colorName">Name</FieldLabel>
									<Input
										id="colorName"
										placeholder="Pick a color to name it"
										{...field}
										onChange={(e) => {
											// Clearing the name hands it back to auto-naming
											setNameEdited(e.target.value !== "");
											field.onChange(e.target.value);
										}}
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
					</FieldGroup>
				</form>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button type="submit" form="printing-color-form" disabled={form.formState.isSubmitting}>
						Add Color
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
