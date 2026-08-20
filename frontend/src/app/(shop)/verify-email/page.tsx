"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import apiSession from "@/lib/api";

function VerifyEmailContent() {
	const router = useRouter();
	const { update } = useSession();
	const searchParams = useSearchParams();
	const email = searchParams.get("email");
	const callbackUrl = searchParams.get("callbackUrl") ?? "/";

	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const verify = async function () {
		setError(null);
		setSubmitting(true);
		try {
			const { data } = await apiSession.post("/auth/verify-email", {
				verificationString: code,
			});
			await update({ userId: data.userId, email: data.email, phoneNumber: data.phoneNumber });
			router.push(callbackUrl);
		} catch (err: any) {
			if (err?.response?.status === 401) {
				setError("That code is incorrect. Please try again.");
			} else {
				setError("Something went wrong verifying your email.");
			}
			setSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col items-center text-center gap-8 w-full max-w-md">
			<div className="size-16 rounded-full bg-muted flex items-center justify-center">
				<MailCheck className="size-7 text-muted-foreground" />
			</div>

			<div className="flex flex-col gap-3">
				<p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
					Confirm your email
				</p>
				<h1 className="text-4xl font-serif leading-snug">
					Check your <span className="italic">inbox.</span>
				</h1>
				<p className="text-muted-foreground leading-relaxed">
					{email ? (
						<>
							We sent a confirmation code to{" "}
							<span className="text-foreground font-medium">{email}</span>.
						</>
					) : (
						"We sent a confirmation code to your email."
					)}
				</p>
			</div>

			<form onSubmit={(e) => { e.preventDefault(); verify() }} className="flex flex-col items-center gap-4 w-full">
				<InputOTP
					value={code}
					onChange={(value) => {
						setCode(value);
						setError(null);
					}}
					maxLength={6}
					autoFocus
					disabled={submitting}
				>
					<InputOTPGroup>
						<InputOTPSlot index={0} />
						<InputOTPSlot index={1} />
						<InputOTPSlot index={2} />
					</InputOTPGroup>
					<InputOTPSeparator />
					<InputOTPGroup>
						<InputOTPSlot index={3} />
						<InputOTPSlot index={4} />
						<InputOTPSlot index={5} />
					</InputOTPGroup>
				</InputOTP>
				{error && <p className="text-sm text-red-500">{error}</p>}
				<Button type="submit" disabled={submitting || code.length !== 6}>
					{submitting ? "Verifying..." : "Verify"}
				</Button>
			</form>
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<div className="min-h-[60vh] flex items-center justify-center px-6 py-20">
			<Suspense fallback={null}>
				<VerifyEmailContent />
			</Suspense>
		</div>
	);
}
