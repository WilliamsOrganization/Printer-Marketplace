"use client";

import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble"
import { Message } from "@/lib/types";

export function ChatWithUserUs({message}:{message: Message}){
	return (
      <Bubble align="end">
        <BubbleContent>Hey there! what&apos;s up?</BubbleContent>
      </Bubble>
	)
}
