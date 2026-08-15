"use client";
import { CreateInventoryItemForm } from "@/components/ui/create-inventory-item-form";
import { GalleryVerticalEnd } from "lucide-react";

function page() {
	return (
		<div className="bg-muted flex min-h-[100vh] flex-col items-center justify-between gap-6 p-6 md:p-10">
			<div className="flex  w-full max-w-full flex-col items-center justify-center gap-6">
				<a href="#" className="flex items-center gap-2 self-center font-medium">
					<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
						<GalleryVerticalEnd className="size-4" />
					</div>
					Acme Inc.
				</a>
				<CreateInventoryItemForm />
			</div>
		</div>
	);
}

export default page;
