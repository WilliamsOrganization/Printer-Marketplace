"use client";

import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Wraps a control that isn't wired up yet. Dims it, shows a not-allowed
 * cursor and a "Coming soon" tooltip on hover, and swallows clicks so the
 * inner control can never fire. Use this instead of leaving dead buttons
 * that look clickable.
 */
export function ComingSoon({
	children,
	label = "Coming soon",
	className,
}: {
	children: React.ReactNode;
	label?: string;
	className?: string;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<span
					aria-disabled
					tabIndex={0}
					onClickCapture={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
					onKeyDownCapture={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
						}
					}}
					className={cn(
						"inline-flex cursor-not-allowed opacity-50 [&_*]:pointer-events-none",
						className,
					)}
				>
					{children}
				</span>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}

export default ComingSoon;
