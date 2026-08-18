"use client";

import { IconMessageCircle } from "@tabler/icons-react";

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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UnderConstruction } from "./under-construction";

export function ChatWithUserDialog() {
	return (
		<Dialog>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-foreground size-8"
						>
							<IconMessageCircle />
							<span className="sr-only">Chat with user</span>
						</Button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>Chat with user</TooltipContent>
			</Tooltip>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Chat with user</DialogTitle>
					<DialogDescription>
						Message the customer directly about this return.
					</DialogDescription>
				</DialogHeader>
				<UnderConstruction title="Chat with user" className="py-8" />
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default ChatWithUserDialog;
