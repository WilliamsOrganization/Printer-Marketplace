"use client";

import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble"
import { ChatMessage } from "@/lib/types";

export function ChatWithUserThem({ message }: { message: ChatMessage }) {
	return (
		<BubbleGroup>
			<Bubble variant="muted">
				<BubbleContent>
					{message.content}
				</BubbleContent>
				<BubbleReactions
					role="img"
					aria-label="Reactions: thumbs up, fire, eyes, and 2 more"
				>
					<span>👍</span>
					<span>🔥</span>
					<span>👀</span>
					<span>+2</span>
				</BubbleReactions>
			</Bubble>
		</BubbleGroup>
	)
}
