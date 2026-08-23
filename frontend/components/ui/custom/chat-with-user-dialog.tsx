"use client";

import { IconMessageCircle } from "@tabler/icons-react";
import { Client } from "@stomp/stompjs";

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
import { Chat, ChatMessage, ChatMessageType, User, UserRole } from "@/lib/types";
import { Input } from "../input";
import { useEffect, useRef, useState } from "react";
import { getSession } from "next-auth/react";

export function ChatWithUserDialog({ chat }: { chat: Chat | null }) {
	const startOrContinueConversation = !chat ? "Start A Conversation!" : "Send a Message";
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [message, setMessage] = useState<string>("");
	const stompClientRef = useRef<Client | null>(null);
	const [opened, setOpened] = useState<boolean>(false);

	// Connects only while the dialog is open (opened drives both Dialog's
	// `open` prop below and this effect) - closing the dialog runs the
	// cleanup, which deactivates the client, so we don't hold a socket open
	// in the background for a dialog nobody's looking at.
	//
	// brokerURL is hardcoded to localhost:8080 - this only works because
	// this feature has so far been developed/tested with the backend port
	// directly reachable from the browser (either literally on localhost,
	// or forwarded the same way the frontend's own port is). It will break
	// anywhere that isn't true - a different dev machine, a teammate's
	// setup, or prod. Before shipping this needs to derive the host from
	// window.location instead (e.g. `${location.protocol === "https:" ?
	// "wss:" : "ws:"}//${location.host}/chat/websocket`) and have whatever
	// serves the frontend (nginx, a proxy, etc.) forward /chat with
	// Upgrade/Connection headers through to the backend - see the
	// conversation history for why this exact setup was needed in dev.
	useEffect(() => {
		if (!opened) return;

		let client: Client;
		// getSession() below is async, but a useEffect callback can't be
		// async itself (React expects void or a sync cleanup fn back, not a
		// Promise) - hence the async IIFE. `cancelled` guards against the
		// dialog closing (running cleanup) while getSession() is still in
		// flight, so we don't activate a client after cleanup already ran.
		let cancelled = false;

		(async () => {
			const session = await getSession();
			const sessionToken = session?.backendToken;
			if (cancelled) return;

			console.log("[chat] connecting to", "ws://localhost:8080/chat/websocket", "with token", sessionToken);

			client = new Client({
				brokerURL: "ws://localhost:8080/chat/websocket",
				// Sent inside the STOMP CONNECT frame, not as an HTTP
				// header - the browser's WebSocket API can't set HTTP
				// headers on the handshake itself. The backend reads this
				// in StompAuthChannelInterceptor
				// (backend/.../config/StompAuthChannelInterceptor.java),
				// NOT in the usual SessionAuthFilter - that filter
				// explicitly skips /chat/** because it would never see
				// this header (it only sees the HTTP-layer handshake
				// request, which has no custom headers on it at all).
				connectHeaders: { Authorization: `Bearer ${sessionToken}` },
				// Verbose debug instrumentation added while diagnosing the
				// original connection issue (see conversation history:
				// missing connection logic -> auth header unreachable by
				// the HTTP filter -> unreachable port -> CORS/origin
				// rejection, in that order). Safe to trim once this
				// feature is confirmed stable - `debug` in particular is
				// very chatty (every STOMP protocol frame).
				debug: (msg) => console.log("[chat][stomp]", msg),
				onConnect: () => {
					console.log("[chat] onConnect fired");
					setIsConnected(true);
					client.subscribe("/topic/chat", (frame) => {
						setMessages((prev) => [...prev, JSON.parse(frame.body)]);
						console.log("this is the message", JSON.parse(frame.body));
					});
				},
				onDisconnect: () => {
					console.log("[chat] onDisconnect fired");
					setIsConnected(false);
				},
				onWebSocketError: (event) => {
					console.log("[chat] onWebSocketError", event);
				},
				onWebSocketClose: (event) => {
					// code 1006 = abnormal closure: the WebSocket never got
					// a real 101 handshake response back (e.g. the server
					// answered with a plain HTTP error instead of
					// upgrading, or the port genuinely wasn't reachable).
					// Browsers can't report *why* in more detail than this
					// for security reasons - check the backend logs for
					// the real cause when you see this.
					console.log("[chat] onWebSocketClose", event.code, event.reason, event);
				},
				onStompError: (frame) => {
					console.log("[chat] onStompError", frame.headers, frame.body);
				},
			});

			stompClientRef.current = client;
			client.activate();
		})();

		return () => {
			cancelled = true;
			client?.deactivate();
		};
	}, [opened]);

	const sendMessage = () => {
		if (!message.trim() || !stompClientRef.current?.connected) return;

		const chatMessage: ChatMessage = {
			type: ChatMessageType.CHAT,
			content: message,
			sender: true,
			createdAt: new Date().toISOString(),
			id: crypto.randomUUID(),
		};
		setMessages((prev) => [...prev, chatMessage]);

		stompClientRef.current.publish({
			destination: "/server/chat.message",
			body: JSON.stringify(chatMessage),
		});
		setMessage("");
	};


	// open/onOpenChange (rather than an uncontrolled Dialog) is what makes
	// closing the dialog actually tear down the connection above - without
	// this, Radix manages open/closed state internally and `opened` would
	// only ever flip true once, so reopening the dialog wouldn't reconnect.
	return (
		<Dialog open={opened} onOpenChange={setOpened}>
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
