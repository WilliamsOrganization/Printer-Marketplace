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
import { useState } from "react";
import apiSession from "@/lib/api";
import { useDashboard } from "@/src/context/dashboard-context";

export function ReturnReviewedToggle({ returnId,  reviewed }: { returnId: number, reviewed: boolean }) {
	const nextLabel = reviewed ? "Pending" : "Reviewed";
	const { setReturns } = useDashboard();

	const handleReviewToggle = (status: boolean) => {
		apiSession
			.post("/returns/review", { id: returnId, reviewed: status })
			.then((res) => {
				toast.success("Return marked as " + (status ? "reviewed" : "pending"));
				setReturns((prev) => prev.map((r) => (r.id === returnId ? { ...r, reviewed: status } : r)));
			})
			.catch((err) => {
				toast.error("Failed to mark return as " + (status ? "reviewed" : "pending"));
				console.error(err);
			});
	};

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
					<AlertDialogAction onClick={() => handleReviewToggle(!reviewed)}>
						Yes, mark as {nextLabel.toLowerCase()}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default ReturnReviewedToggle;
