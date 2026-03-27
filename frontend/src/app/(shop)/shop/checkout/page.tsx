"use client";
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/ui/custom/login-form";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import { CheckoutForm } from "@/components/ui/custom/checkout-form";

export default function LoginPage() {
	return (
		<div className="bg-muted flex min-h-[70vh] flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<a href="#" className="flex items-center gap-2 self-center font-medium">
					<Image src="/logo-icon.svg" width={30} height={30} />
					PrintMarket Inc.
				</a>
				<CheckoutForm />
			</div>
		</div>
	);
}
