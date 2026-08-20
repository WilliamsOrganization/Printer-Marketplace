"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/ui/custom/login-form";

function LoginFormWithCallback() {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") ?? "/";
	return <LoginForm callbackUrl={callbackUrl} />;
}

export default function LoginPage() {
	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<Suspense fallback={null}>
					<LoginFormWithCallback />
				</Suspense>
			</div>
		</div>
	);
}
