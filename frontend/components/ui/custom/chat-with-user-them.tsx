"use client";

import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble"
import { Message } from "@/lib/types";

export function ChatWithUserThem({ message }: { message: Message }) {
	return (
		<BubbleGroup>
			<Bubble variant="muted">
				<BubbleContent>Hey! Want to see chat bubbles?</BubbleContent>
			</Bubble>
			<Bubble variant="muted">
				<BubbleContent>
					You are reading a demo that is demoing itself. Very meta. Very on-brand.
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
