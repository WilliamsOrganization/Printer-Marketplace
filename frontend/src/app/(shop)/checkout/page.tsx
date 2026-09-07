"use client";
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/ui/custom/login-form";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { CheckoutForm } from "@/components/ui/custom/checkout-form";
import { BrandMark } from "@/components/ui/custom/brand-mark";

export default function LoginPage() {
	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="flex min-w-auto   flex-col gap-6">
				<BrandMark />
				<CheckoutForm />
			</div>
		</div>
	);
}
