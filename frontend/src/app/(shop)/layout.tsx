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
		<>
			<Header />
			<PromoBanner />
			<TooltipProvider>{children}</TooltipProvider>
			<Toaster position="top-center" />
			<Footer />
		</>
	);
}
