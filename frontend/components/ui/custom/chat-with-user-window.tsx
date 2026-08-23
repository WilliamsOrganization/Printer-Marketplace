import { ChatMessage } from "@/lib/types"
import { ChatWithUserThem } from "./chat-with-user-them"
import { ChatWithUserUs } from "./chat-with-user-us"

export function ChatWithUserWindow({ messages }: { messages: ChatMessage[] | null }) {

	return (
		<div className="flex w-full max-w-sm flex-col gap-8 py-12">
			{!messages || messages.length === 0 ? (
				<p className="text-muted-foreground text-center text-sm">
					{messages === null ? "No conversation started yet" : "No messages yet"}
				</p>
			) : (
				messages.map((message) =>
					!message.sender ? (
						<ChatWithUserThem key={message.id} message={message} />
					) : (
						<ChatWithUserUs key={message.id} message={message} />
					)
				)
			)}
		</div>
	)
}

