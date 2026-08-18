"use client";

import { toast } from "sonner";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export function ReturnReviewedToggle({ reviewed }: { reviewed: boolean }) {
	const nextLabel = reviewed ? "Pending" : "Reviewed";

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Badge
					variant={reviewed ? "secondary" : "outline"}
					className="cursor-pointer"
				>
					{reviewed ? "Reviewed" : "Pending"}
				</Badge>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Mark return as {nextLabel.toLowerCase()}?</AlertDialogTitle>
					<AlertDialogDescription>
						This will flip the review status from &ldquo;{reviewed ? "Reviewed" : "Pending"}&rdquo; to
						&ldquo;{nextLabel}&rdquo;.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={() => toast("Reviewing returns isn't wired up yet.")}>
						Yes, mark as {nextLabel.toLowerCase()}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default ReturnReviewedToggle;
