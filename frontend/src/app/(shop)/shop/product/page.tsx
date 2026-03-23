import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FilterSidebar } from "@/components/ui/custom/filter-sidebar";
import { SortSelect } from "@/components/ui/custom/sort-select";
import apiServer from "@/lib/api-server";
import { CategoryLabel, InventoryItem } from "@/lib/types";
import ProductGrid from "@/components/ui/custom/product-card";

// Finish Me! Product page
export default async function ShopPage() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-4">
			{/* Product Grid */}
			<main className="min-h-[60vh] flex flex-col items-center justify-center">
				<p>
					TODO: all page links to me must be wrapped in server component for SEO indexing
				</p>

				<Image src="/logo.svg" alt="PrintMarket" width={860} height={220} />
				<p>
					Testing build pipeline
				</p>

			</main>
		</div>
	);
}
