import Header from "@/components/ui/custom/header";
import Footer from "@/components/ui/custom/footer";
import { PromoBanner } from "@/components/ui/custom/promo-banner";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function ShopLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<PromoBanner />
			{/* White content surface; the header and footer carry the tint. */}
			<TooltipProvider>
				<main className="flex-1 bg-background">{children}</main>
			</TooltipProvider>
			<Toaster position="top-center" />
			<Footer />
		</div>
	);
}
