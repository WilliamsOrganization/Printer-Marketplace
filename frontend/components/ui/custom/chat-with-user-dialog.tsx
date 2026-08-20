"use client";

import { IconMessageCircle } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChatWithUserWindow } from "./chat-with-user-window";
import { Chat, Message, User, UserRole } from "@/lib/types";
import { Input } from "../input";
import { useState } from "react";

const DUMMY_ADMIN: User = {
	id: 1,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	email: "support@example.com",
	phoneNumber: "",
	password: "",
	isAdmin: true,
	userRole: UserRole.ADMIN,
};

const DUMMY_CUSTOMER: User = {
	id: 2,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	email: "customer@example.com",
	phoneNumber: "",
	password: "",
	isAdmin: false,
	userRole: UserRole.REGISTERED,
};

const DUMMY_CHAT: Chat = {
	id: 0,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	admin: DUMMY_ADMIN,
	customer: DUMMY_CUSTOMER,
	messages: [],
};

const DUMMY_MESSAGES: Message[] = [
	{
		id: 1,
		createdAt: new Date(Date.now() - 60_000).toISOString(),
		updatedAt: new Date(Date.now() - 60_000).toISOString(),
		chat: DUMMY_CHAT,
		sender: DUMMY_CUSTOMER,
		content: "Hey, I still haven't gotten my refund for this return.",
	},
	{
		id: 2,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		chat: DUMMY_CHAT,
		sender: DUMMY_ADMIN,
		content: "Sorry about that, I'm looking into it now.",
	},
];

export function ChatWithUserDialog({ chat }: { chat: Chat | null }) {
	const startOrContinueConversation = !chat ? "Start A Conversation!" : "Send a Message";
	const [message, setMessage] = useState<string>("");
	const [messages, setMessages] = useState<Message[]>(
		chat ? [...chat.messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt)) : DUMMY_MESSAGES
	);

	const sendMessage = () => {
		if (!message.trim()) return;

		setMessages(prev => [
			...prev,
			{
				id: Date.now(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				chat: chat ?? DUMMY_CHAT,
				sender: DUMMY_ADMIN,
				content: message,
			},
		]);
		setMessage("");
	};

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
				<ChatWithUserWindow messages={messages} />
				<DialogFooter>
					<Input
						type="text"
						placeholder={startOrContinueConversation}
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && sendMessage()}
					/>
					<Button variant="default" onClick={sendMessage}>Send</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default ChatWithUserDialog;
