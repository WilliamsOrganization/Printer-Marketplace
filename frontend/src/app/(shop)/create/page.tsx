"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CreateAccountForm } from "@/components/ui/custom/create-account-form";

function CreateAccountFormWithCallback() {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") ?? "/";
	return <CreateAccountForm callbackUrl={callbackUrl} />;
}

export default function CreateAccountPage() {
	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<Suspense fallback={null}>
					<CreateAccountFormWithCallback />
				</Suspense>
			</div>
		</div>
	);
}
