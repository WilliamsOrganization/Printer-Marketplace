import Image from "next/image";
import { Button } from "@/components/ui/button";
import BasicMenu from "@/components/ui/menu";
import Header from "@/components/ui/custom/header";
import { NavigationMenuDemo } from "@/components/ui/custom/navigation";
import { Sheet, Sidebar } from "lucide-react";
import { CollapsibleBasic } from "@/components/ui/custom/collapsemenu";

export default function Home() {
	return (
		<div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black ">
				<Image src="/globe.svg" className="dark:invert"  alt="logo" width={500} height={500} />
			</main>
		</div>
	);
}
