"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { KeyRound, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import apiSession from "@/lib/api";

function RequestResetForm() {
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const requestReset = async function () {
		setError(null);
		setSubmitting(true);
		try {
			await apiSession.post("/auth/reset-password", { email });
			setSent(true);
		} catch (err: any) {
			if (err?.response?.status === 404) {
				// Don't reveal whether the email exists - show the same
				// "check your inbox" state either way.
				setSent(true);
			} else {
				setError("Something went wrong sending the reset link. Please try again.");
			}
		} finally {
			setSubmitting(false);
		}
	};

	if (sent) {
		return (
			<div className="flex flex-col items-center text-center gap-8 w-full max-w-md">
				<div className="size-16 rounded-full bg-muted flex items-center justify-center">
					<MailCheck className="size-7 text-muted-foreground" />
				</div>
				<div className="flex flex-col gap-3">
					<p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
						Check your inbox
					</p>
					<h1 className="text-4xl font-serif leading-snug">
						Reset link <span className="italic">sent.</span>
					</h1>
					<p className="text-muted-foreground leading-relaxed">
						If an account exists for{" "}
						<span className="text-foreground font-medium">{email}</span>,
						we&apos;ve sent a link to reset your password.
					</p>
				</div>
			</div>
		);
	}

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle className="text-xl">Reset your password</CardTitle>
				<CardDescription>
					Enter your email and we&apos;ll send you a reset link
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={(e) => { e.preventDefault(); requestReset() }}>
					<FieldGroup>
						<Field>
							{error && <p className="text-sm text-red-500">{error}</p>}
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="m@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</Field>
						<Field>
							<Button type="submit" disabled={submitting}>
								{submitting ? "Sending..." : "Send reset link"}
							</Button>
							<FieldDescription className="text-center">
								Remembered your password? <a href="/login">Log in</a>
							</FieldDescription>
						</Field>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}

function ConfirmResetForm({ email, code }: { email: string; code: string }) {
	const router = useRouter();
	const { update } = useSession();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const confirmReset = async function () {
		setError(null);
		if (password !== confirmPassword) {
			setError("Passwords don't match.");
			return;
		}
		setSubmitting(true);
		try {
			const { data } = await apiSession.post("/auth/reset-password/confirm", {
				email,
				verificationString: code,
				password,
			});
			await update({ userId: data.userId, email: data.email, phoneNumber: data.phoneNumber });
			router.push("/");
		} catch (err: any) {
			if (err?.response?.status === 401) {
				setError("This reset link is invalid or has expired.");
			} else {
				setError("Something went wrong resetting your password.");
			}
			setSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col items-center text-center gap-8 w-full max-w-md">
			<div className="size-16 rounded-full bg-muted flex items-center justify-center">
				<KeyRound className="size-7 text-muted-foreground" />
			</div>
			<div className="flex flex-col gap-3">
				<p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
					Reset your password
				</p>
				<h1 className="text-4xl font-serif leading-snug">
					Choose a <span className="italic">new password.</span>
				</h1>
			</div>

			<form
				onSubmit={(e) => { e.preventDefault(); confirmReset() }}
				className="flex flex-col gap-4 w-full max-w-sm text-left"
			>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="password">New password</FieldLabel>
						<Input
							id="password"
							name="password"
							type="password"
							required
							minLength={8}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className={error ? "border-red-500/50" : ""}
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							required
							minLength={8}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className={error ? "border-red-500/50" : ""}
						/>
					</Field>
					{error && <p className="text-sm text-red-500">{error}</p>}
					<Button type="submit" disabled={submitting}>
						{submitting ? "Resetting..." : "Reset password"}
					</Button>
				</FieldGroup>
			</form>
		</div>
	);
}

function ResetPasswordContent() {
	const searchParams = useSearchParams();
	const email = searchParams.get("email");
	const code = searchParams.get("code");

	if (email && code) {
		return <ConfirmResetForm email={email} code={code} />;
	}
	return (
		<div className="flex w-full max-w-sm flex-col gap-6">
			<RequestResetForm />
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 p-6 md:p-10">
			<Suspense fallback={null}>
				<ResetPasswordContent />
			</Suspense>
		</div>
	);
}
