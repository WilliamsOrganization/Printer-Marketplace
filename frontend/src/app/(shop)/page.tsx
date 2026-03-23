import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Layers, ArrowRight, Package, Paintbrush, Timer } from "lucide-react";
import apiServer from "@/lib/api-server";
import { InventoryItem, ItemBadge } from "@/lib/types";
import ProductGrid from "@/components/ui/custom/product-card";

const features = [
	{
		icon: Layers,
		title: "Layer by Layer",
		description:
			"Every product is printed to order with precision FDM and resin technology.",
	},
	{
		icon: Paintbrush,
		title: "Fully Custom",
		description:
			"Don't see what you want? Send us your design and we'll bring it to life.",
	},
	{
		icon: Timer,
		title: "Fast Turnaround",
		description:
			"Most orders ship within 3–5 business days straight to your door.",
	},
	{
		icon: Package,
		title: "Built to Last",
		description: "We use only high-quality PETG, PLA+, and resin materials.",
	},
];

const galleryImages = [
	"/stock-1.jpg",
	"/stock-2.jpg",
	"/stock-3.jpg",
	"/stock-4.jpg",
	"/stock-5.jpg",
	"/stock-6.jpg",
];

export default async function Home() {
	const products: InventoryItem[] = await apiServer
		.get("/inventoryitem")
		.then((res) => res.data)
		.catch(() => []);

	const featured = products
		.filter((p) => p.badge === ItemBadge.BESTSELLER)
		.slice(0, 4);

	return (
		<div className="flex flex-col">
			{/* Hero */}
			<section className="min-h-[50vh] relative flex items-center overflow-hidden">
				<div className="absolute right-0 top-0 bottom-0 w-1/2 grid grid-cols-2 grid-rows-3">
					{galleryImages.map((src, i) => (
						<div key={i} className="relative overflow-hidden">
							<Image src={src} alt="" fill className="object-cover" />
						</div>
					))}
				</div>
				<div className="absolute inset-0 bg-gradient-to-r from-background from-40% via-background/80 via-60% to-transparent" />
				<div className="relative z-10 w-1/2 flex items-center justify-center py-16">
					<div className="flex flex-col gap-6 max-w-xl px-12">
						<p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
							Made to order · Ships in 3–5 days
						</p>
						<h1 className="text-5xl font-serif leading-[1.15]">
							Built,{" "}
							<span className="italic">layer by layer.</span>
						</h1>
						<p className="text-base text-muted-foreground leading-relaxed">
							Custom 3D printed goods crafted with care. Browse our catalogue
							or send us your own design.
						</p>
						<div className="flex items-center gap-5">
							<Button asChild>
								<Link href="/shop">
									Shop
									<ArrowRight className="ml-2 size-4" />
								</Link>
							</Button>
							<Link
								href="/shop"
								className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
							>
								Send us a design
							</Link>
						</div>
					</div>
				</div>
			</section>

			<Separator />

			{/* Featured products */}
			<section className="max-w-7xl mx-auto px-6 py-12 w-full">
				<div className="flex items-end justify-between mb-10">
					<div>
						<h2 className="text-3xl font-serif capitalize">bestsellers</h2>
					</div>
					<Button variant="ghost" asChild className="text-muted-foreground">
						<Link href="/shop">
							View all <ArrowRight className="ml-2 size-4" />
						</Link>
					</Button>
				</div>
				<ProductGrid products={featured} />
			</section>

			{/* CTA */}
			<section className="max-w-7xl mx-auto px-6 py-12 w-full">
				<div className="rounded-2xl border bg-muted/30 px-12 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
					<div className="flex flex-col gap-3">
						<p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
							Custom orders
						</p>
						<h2 className="text-3xl font-serif">
							Have a design{" "}
							<span className="italic">in mind?</span>
						</h2>
						<p className="text-muted-foreground max-w-sm leading-relaxed">
							Send us your file and we'll handle the rest — material selection,
							settings, and delivery.
						</p>
					</div>
					<Button size="lg" asChild className="shrink-0">
						<Link href="/shop">
							Get a Quote <ArrowRight className="ml-2 size-4" />
						</Link>
					</Button>
				</div>
			</section>
		</div>
	);
}
