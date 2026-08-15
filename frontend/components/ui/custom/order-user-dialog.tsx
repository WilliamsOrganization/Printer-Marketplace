"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/lib/types";

function formatTimestamp(value?: string) {
	if (!value) return "—";
	return new Date(value).toLocaleString(undefined, {
		dateStyle: "long",
		timeStyle: "medium",
	});
}

export function OrderUserDialog({ user }: { user: User }) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="link" className="text-foreground truncate px-0 text-left">
					{user?.email ?? "—"}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Customer</DialogTitle>
					<DialogDescription>
						Account details for this order&apos;s customer.
					</DialogDescription>
				</DialogHeader>
				<FieldGroup>
					<Field>
						<Label htmlFor="user-email">Email</Label>
						<Input id="user-email" readOnly defaultValue={user?.email ?? ""} />
					</Field>
					<Field>
						<Label htmlFor="user-phone">Phone</Label>
						<Input id="user-phone" readOnly defaultValue={user?.phoneNumber ?? ""} />
					</Field>
					<Field>
						<Label htmlFor="user-role">Role</Label>
						<Input id="user-role" readOnly defaultValue={user?.userRole ?? ""} />
					</Field>
					<Field>
						<Label htmlFor="user-id">User ID</Label>
						<Input id="user-id" readOnly defaultValue={user?.id ?? ""} />
					</Field>
					<Field>
						<Label htmlFor="user-created">Account Created</Label>
						<Input id="user-created" readOnly defaultValue={formatTimestamp(user?.createdAt)} />
					</Field>
					<Field>
						<Label htmlFor="user-updated">Last Updated</Label>
						<Input id="user-updated" readOnly defaultValue={formatTimestamp(user?.updatedAt)} />
					</Field>
				</FieldGroup>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default OrderUserDialog;
