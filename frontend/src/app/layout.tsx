import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/ui/custom/header";
import Footer from "@/components/ui/custom/footer";
import { PromoBanner } from "@/components/ui/custom/promo-banner";
import { Toaster } from "sonner";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "PrintMarket",
	description: "Find new printables market",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`} >
				<Header/>
				<PromoBanner />
				<TooltipProvider>{children}</TooltipProvider>
				<Toaster position="top-center"/>
				<Footer/>
			</body>
		</html>
	);
}
