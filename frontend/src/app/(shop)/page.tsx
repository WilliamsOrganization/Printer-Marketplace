import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { FilterSidebar } from "@/components/ui/custom/filter-sidebar";
import { SortSelect } from "@/components/ui/custom/sort-select";
import apiServer from "@/lib/api-server";
import { InventoryItem } from "@/lib/types";
import ProductGrid from "@/components/ui/custom/product-card";

// TODO: these button toggles for prices arent working
const priceRanges = [
	{ id: "under50", label: "Under $50", min: 0, max: 50 },
	{ id: "50to75", label: "$50 - $75", min: 50, max: 75 },
	{ id: "over75", label: "Over $75", min: 75, max: Infinity },
];

type SearchParams = {
	itemCost?: string | string[];
	sort?: string;
};

export default async function ShopPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const params = await searchParams;

	const products: InventoryItem[] = await apiServer
		.get("/inventoryitem")
		.then((res) => {
			console.log("Successfully fetched product items: ");
			return res.data;
		})
		.catch((err) => {
			console.log("Error happened: " + err.message);
			return [];
		});

	// Parse params - handle both single values and arrays
	const selectedPriceRanges = params.itemCost
		? Array.isArray(params.itemCost)
			? params.itemCost
			: [params.itemCost]
		: [];
	const sortBy = params.sort || "featured";

	// Filter products on server
	const filteredProducts = products
		.filter((product) => {
			const priceMatch =
				selectedPriceRanges.length === 0 ||
				selectedPriceRanges.some((rangeId) => {
					const range = priceRanges.find((r) => r.id === rangeId);
					return (
						range &&
						product.itemCost >= range.min &&
						product.itemCost < range.max
					);
				});
			return priceMatch;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "featured":
					return a.id - b.id;
				case "newest":
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				case "price-asc":
					return a.itemCost - b.itemCost;
				case "price-desc":
					return b.itemCost - a.itemCost;
				case "name":
					return a.itemTitle.localeCompare(b.itemTitle);
				default:
					return 0;
			}
		});

	return (
		<div className="mx-auto max-w-7xl px-4 py-4">
			{/* Filter + sort bar */}
			<div className="flex items-center justify-between gap-4 mb-4">
				<FilterSidebar
					priceRanges={priceRanges}
					selectedPriceRanges={selectedPriceRanges}
				/>
				<div className="flex items-center gap-3 ml-auto">
					<p className="text-xs tracking-wide text-muted-foreground whitespace-nowrap">
						{filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}
					</p>
					<SortSelect currentSort={sortBy} />
				</div>
			</div>

			{/* Product Grid */}
			<main>
				<ProductGrid products={filteredProducts} />

				{filteredProducts.length === 0 && (
					// min-h is 60vh (matching orders/returns) minus 2x the ~68px the
					// wrapper padding + filter bar push this down, so the content
					// centers in the same spot as those pages' empty states.
					<section className="min-h-[calc(60vh-136px)] flex items-center justify-center px-6 py-20">
						<div className="flex flex-col items-center text-center gap-3 w-full max-w-md text-muted-foreground">
							<div className="size-16 rounded-full bg-muted flex items-center justify-center">
								<ShoppingCart className="size-7" />
							</div>
							<div className="text-center">
								<p className="font-serif italic text-foreground">
									Nothing here yet.
								</p>
								<p className="text-xs mt-1 tracking-wide">
									Try adjusting your filters.
								</p>
							</div>
							<Button asChild className="mt-4">
								<Link href="/">
									Clear filters
									<ArrowRight className="ml-2 size-4" />
								</Link>
							</Button>
						</div>
					</section>
				)}
			</main>
		</div>
	);
}
