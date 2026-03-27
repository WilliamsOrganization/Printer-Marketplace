import { Toaster } from "sonner";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Admin Dashboard",
	description: "Admin dashboard",
};

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			{children}
			<Toaster position="top-center" />
		</>
	);
}
