import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Stacked brand lockup - large logo above the company name.
 * Sits above the card on the login / checkout flows.
 */
export function BrandMark({ className }: { className?: string }) {
	return (
		<Link
			href="/"
			className={cn(
				"flex flex-col items-center gap-3 self-center font-medium",
				className,
			)}
		>
			<Image
				src="/amys-logo-final.png"
				alt="LittleBrick3DPrinting"
				width={112}
				height={112}
				priority
				className="size-28"
			/>
			LittleBrick3DPrinting Inc.
		</Link>
	);
}

export default BrandMark;
