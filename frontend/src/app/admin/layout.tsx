"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SessionProvider>
			{children}
			<Toaster position="top-center" />
		</SessionProvider>
	);
}
