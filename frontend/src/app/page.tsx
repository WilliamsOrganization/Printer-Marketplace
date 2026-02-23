import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
			<section className="min-h-[40vh] relative flex items-center overflow-hidden">
				<div className="absolute right-0 top-0 bottom-0 w-1/2 grid grid-cols-2 grid-rows-3">
					{galleryImages.map((src, i) => (
						<div key={i} className="relative overflow-hidden">
							<Image src={src} alt="" fill className="object-cover" />
						</div>
					))}
				</div>
				<div className="absolute inset-0 bg-gradient-to-r from-background from-40% via-background/80 via-60% to-transparent" />
				<div className="relative z-10 w-1/2 flex items-center justify-center py-12">
					<div className="flex flex-col gap-4 max-w-xl px-12">
						<Badge variant="secondary" className="w-fit px-3 py-1">
							Made to Order · Ships in 3–5 Days
						</Badge>
						<h1 className="text-4xl font-bold tracking-tight leading-none">
							Built <span className="text-primary">Layer</span> by Layer
						</h1>
						<p className="text-base text-muted-foreground leading-relaxed">
							Custom 3D printed goods crafted with precision. Browse our
							catalogue or send us your own design.
						</p>
						<div className="flex gap-3">
							<Button asChild>
								<Link href="/shop">
									Browse Catalogue
									<ArrowRight className="ml-2 size-4" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			<Separator />

			{/* Featured products */}
			<section className="max-w-7xl mx-auto px-6 py-16 w-full">
				<div className="flex items-end justify-between mb-8">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">Featured</h2>
						<p className="text-muted-foreground mt-1">
							Our most popular prints.
						</p>
					</div>
					<Button variant="outline" asChild>
						<Link href="/shop">
							View all <ArrowRight className="ml-2 size-4" />
						</Link>
					</Button>
				</div>
				<ProductGrid products={featured} />
			</section>

			<Separator />

			{/* Features */}
			<section className="max-w-7xl mx-auto px-6 py-16 w-full">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
					{features.map(({ icon: Icon, title, description }) => (
						<div key={title} className="flex flex-col gap-3">
							<div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
								<Icon className="size-5 text-primary" />
							</div>
							<h3 className="font-semibold text-lg">{title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{description}
							</p>
						</div>
					))}
				</div>
			</section>

			<Separator />

			{/* CTA Banner */}
			<section className="max-w-7xl mx-auto px-6 py-16 w-full">
				<div className="rounded-2xl bg-primary text-primary-foreground p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
					<div>
						<h2 className="text-2xl font-bold mb-1">Have a design in mind?</h2>
						<p className="text-primary-foreground/80">
							Send us your file and we'll handle the rest.
						</p>
					</div>
					<Button size="lg" variant="secondary" asChild className="shrink-0">
						<Link href="/shop">
							Get a Quote <ArrowRight className="ml-2 size-4" />
						</Link>
					</Button>
				</div>
			</section>
		</div>
	);
}
