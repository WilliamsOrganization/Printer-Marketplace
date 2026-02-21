"use client";
import { Button } from "@/components/ui/button";
import { CreateInventoryItemForm } from "@/components/ui/create-inventory-item-form";
import { GalleryVerticalEnd } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

function page() {
	// const { data: session, status } = useSession();
	// if (status === "unauthenticated") {
	// 	return (
	// 		<div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
	// 			<h1 className="text-6xl font-bold text-muted-foreground">Oops!</h1>
	// 			<h2 className="mt-4 text-xl font-semibold">Access Denied</h2>
	// 			<p className="mt-2 text-muted-foreground text-center max-w-md">
	// 				You need to be logged in to visit this page
	// 			</p>
	// 			<Button asChild className="mt-6">
	// 				<Link href="/admin/">Back to Admin Login</Link>
	// 			</Button>
	// 		</div>
	// 	);
	// }
	return (
		<div className="bg-muted flex min-h-[70vh] flex-col items-center justify-between gap-6 p-6 md:p-10">
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
