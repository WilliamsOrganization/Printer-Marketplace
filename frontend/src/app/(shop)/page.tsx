import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilterSidebar } from "@/components/ui/custom/filter-sidebar";
import { SortSelect } from "@/components/ui/custom/sort-select";
import apiServer from "@/lib/api-server";
import { CategoryLabel, InventoryItem } from "@/lib/types";
import ProductGrid from "@/components/ui/custom/product-card";

// TODO: these button toggles for prices arent working
const priceRanges = [
	{ id: "under50", label: "Under $50", min: 0, max: 50 },
	{ id: "50to75", label: "$50 - $75", min: 50, max: 75 },
	{ id: "over75", label: "Over $75", min: 75, max: Infinity },
];

type SearchParams = {
	category?: string | string[];
	itemCost?: string | string[];
	sort?: string;
};

const categoryOptions = Object.entries(CategoryLabel).map(([id, label]) => ({
	id,
	label,
}));

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
	const selectedCategories = params.category
		? Array.isArray(params.category)
			? params.category
			: [params.category]
		: [];
	const selectedPriceRanges = params.itemCost
		? Array.isArray(params.itemCost)
			? params.itemCost
			: [params.itemCost]
		: [];
	const sortBy = params.sort || "featured";

	// Filter products on server
	const filteredProducts = products
		.filter((product) => {
			const categoryMatch =
				selectedCategories.length === 0 ||
				selectedCategories.includes(product.category);
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
			return categoryMatch && priceMatch;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "featured":
					if (a.badge && !b.badge) return -1;
					if (!a.badge && b.badge) return 1;
					return a.id - b.id;
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
			{/* Page header */}
			<div className="border-b mb-4">
				<h1 className="text-3xl font-serif">
					The <span className="italic">catalogue</span>
				</h1>
				<p className="text-sm text-muted-foreground my-2 leading-relaxed">
					Everything is printed to order. Browse, filter, and find your piece.
				</p>
			</div>

			{/* Filter + sort bar */}
			<div className="flex items-center justify-between gap-4 mb-4">
				<FilterSidebar
					categories={categoryOptions}
					priceRanges={priceRanges}
					selectedCategories={selectedCategories}
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
					<div className="text-center py-20 flex flex-col items-center gap-3">
						<p className="font-serif text-xl italic text-muted-foreground">
							Nothing here yet.
						</p>
						<p className="text-sm text-muted-foreground">
							Try adjusting your filters.
						</p>
						<Button variant="link" asChild>
							<Link href="/">Clear filters</Link>
						</Button>
					</div>
				)}
			</main>
		</div>
	);
}
