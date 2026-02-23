import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterSidebar } from "@/components/ui/custom/filter-sidebar";
import { SortSelect } from "@/components/ui/custom/sort-select";
import apiServer from "@/lib/api-server";
import { Category, CategoryLabel, InventoryItem, ItemBadge } from "@/lib/types";
import api from "@/lib/api";
import { AddToCartButton } from "@/components/ui/custom/add-to-cart-button";
import { Input } from "@/components/ui/input";
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

export default async function Home({
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
		<div className="mx-auto max-w-7xl px-6 py-8">
			<div className="flex gap-8">
				{/* Filters Sidebar */}
				<aside className="w-56 shrink-0 hidden md:block">
					<div className="sticky top-24">
						<FilterSidebar
							categories={categoryOptions}
							priceRanges={priceRanges}
							selectedCategories={selectedCategories}
							selectedPriceRanges={selectedPriceRanges}
						/>
					</div>
				</aside>

				{/* Product Grid */}
				<main className="flex-1">
					<div className="flex items-center justify-between mb-6">
						<p className="text-sm text-muted-foreground">
							{filteredProducts.length} products
						</p>
						<SortSelect currentSort={sortBy} />
					</div>
						<ProductGrid products={products}/>

					{filteredProducts.length === 0 && (
						<div className="text-center py-12">
							<p className="text-muted-foreground">
								No products match your filters.
							</p>
							<Button variant="link" asChild>
								<Link href="/">Clear filters</Link>
							</Button>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
