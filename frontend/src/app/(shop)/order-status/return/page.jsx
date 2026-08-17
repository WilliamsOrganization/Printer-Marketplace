import { redirect } from "next/navigation";
import apiServer from "@/lib/api-server";
import { Separator } from "@/components/ui/separator";
import { PackageX } from "lucide-react";
import { ReturnOrderForm } from "@/components/ui/custom/return-order-form";

export default async function ReturnOrder({ searchParams }) {
	const { session_id } = await searchParams;

	if (!session_id)
		throw new Error("Please provide a valid session_id (`cs_test_...`)");

	const { order, session } = await apiServer
		.get(`/orders/${session_id}`)
		.then((res) => res.data)
		.catch((err) => {
			if (err?.response?.status === 404) {
				redirect(
					`/login?callbackUrl=${encodeURIComponent(`/order-status/return?session_id=${session_id}`)}`
				);
			}
			redirect("/");
		});

	if (session.status !== "complete" || order?.shipping?.status !== "DELIVERED") {
		return redirect(`/order-status?session_id=${session_id}`);
	}

	return (
		<div className="flex flex-col">
			<section className="min-h-[60vh] flex items-center justify-center px-6 py-20">
				<div className="flex flex-col items-center text-center gap-8 w-full max-w-3xl">
					<div className="size-16 rounded-full bg-muted flex items-center justify-center">
						<PackageX className="size-7 text-muted-foreground" />
					</div>

					<div className="flex flex-col gap-3 max-w-md">
						<p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
							Return order
						</p>
						<h1 className="text-4xl font-serif leading-snug">
							Select items to return.
						</h1>
						<p className="text-muted-foreground leading-relaxed">
							Choose which items you&apos;d like to send back and let us know why.
						</p>
					</div>

					<Separator />

					<ReturnOrderForm order={order} sessionId={session_id} />
				</div>
			</section>
		</div>
	);
}
