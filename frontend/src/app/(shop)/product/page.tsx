import Image from "next/image";

// Finish Me! Product page
export default async function ShopPage() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-4">
			{/* Product Grid */}
			<main className="min-h-[60vh] flex flex-col items-center justify-center">
				<p>
					TODO: all page links to me must be wrapped in server component for SEO indexing
				</p>

				<Image src="/amys-logo-final.png" alt="LittleBrick3DPrinting" width={220} height={220} />
				<p>
					Testing build pipeline
				</p>

			</main>
		</div>
	);
}
