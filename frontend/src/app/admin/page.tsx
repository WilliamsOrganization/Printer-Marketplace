"use client";
import { LoginForm } from "@/components/ui/custom/login-form";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
	return (
		<div className="bg-muted flex min-h-[100vh] flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<a href="#" className="flex items-center gap-2 self-center font-medium">
					<Image src="/logo-icon.svg" width={30} height={30} alt="PrintMarket logo" />
					PrintMarket Inc.
				</a>
				<LoginForm />
				<button
					onClick={() => signOut({ callbackUrl: "/admin" })}
					className="text-sm text-muted-foreground underline-offset-4 hover:underline"
				>
					Sign out
				</button>
			</div>
		</div>
	);
}
