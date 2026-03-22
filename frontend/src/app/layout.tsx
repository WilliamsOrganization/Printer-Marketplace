import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/ui/custom/header";
import Footer from "@/components/ui/custom/footer";
import { PromoBanner } from "@/components/ui/custom/promo-banner";
import { Toaster } from "sonner";
import { Providers } from "./providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const playfair = Playfair_Display({
	variable: "--font-playfair",
	subsets: ["latin"],
	style: ["normal", "italic"],
});

export const metadata: Metadata = {
	title: "PrintMarket Shop",
	description: "Find new printables market",
	icons: {
		icon: "/globe.svg",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
			>
				<Providers>
					<Header />
					<PromoBanner />
					<TooltipProvider>{children}</TooltipProvider>
					<Toaster position="top-center" />
					<Footer />
				</Providers>
			</body>
		</html>
	);
}
