"use client";

import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble"
import { ChatMessage } from "@/lib/types";

export function ChatWithUserUs({ message }: { message: ChatMessage }) {
	return (
		<Bubble align="end">
			<BubbleContent>{message.content}</BubbleContent>
			<BubbleReactions
				role="img"
				aria-label="Reactions: thumbs up, fire, eyes, and 2 more"
			>
			</BubbleReactions>
		</Bubble>
	)
}
