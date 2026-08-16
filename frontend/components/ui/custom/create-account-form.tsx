"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import apiSession from "@/lib/api";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export function CreateAccountForm({
	className,
	callbackUrl = "/",
	...props
}: React.ComponentProps<"div"> & { callbackUrl?: string }) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [phone, setPhone] = useState<string | undefined>();

	const createAccount = async function (formData: FormData) {
		setError(null);
		setSubmitting(true);
		const email = formData.get("email") as string;
		try {
			await apiSession.post("/auth/create", {
				email,
				password: formData.get("password"),
				phoneNumber: phone ?? null,
			});
			router.push(
				`/verify-email?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`,
			);
		} catch (err: any) {
			if (err?.response?.status === 409) {
				setError("An account with that email already exists.");
			} else {
				setError("Something went wrong creating your account.");
			}
			setSubmitting(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Create your account</CardTitle>
					<CardDescription>
						Enter your details below to get started
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							createAccount(new FormData(e.currentTarget));
						}}
					>
						<FieldGroup>
							<Field>
								{error && <p className="text-sm text-red-500">{error}</p>}
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="m@example.com"
									required
									className={error ? "border-red-500/50" : ""}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="phoneNumber">
									Phone number{" "}
									<span className="text-muted-foreground font-normal">
										(optional)
									</span>
								</FieldLabel>
								<PhoneInput
									id="phoneNumber"
									name="phoneNumber"
									defaultCountry="CA"
									placeholder="(555) 555-5555"
									value={phone}
									onChange={setPhone}
									className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="password">Password</FieldLabel>
								<Input
									id="password"
									name="password"
									type="password"
									required
									minLength={8}
									className={error ? "border-red-500/50" : ""}
								/>
							</Field>
							<Field>
								<Button type="submit" disabled={submitting}>
									{submitting ? "Creating account..." : "Create account"}
								</Button>
								<FieldDescription className="text-center">
									Already have an account? <a href="/login">Log in</a>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
			<FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
				and <a href="#">Privacy Policy</a>.
			</FieldDescription>
		</div>
	);
}
