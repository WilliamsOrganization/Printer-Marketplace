import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { ChevronDownIcon } from "lucide-react";

export function CollapsibleBasic() {
	return (
		<Collapsible className="group data-[state=open]:bg-muted ">
			<CollapsibleTrigger asChild>
				<Button variant="ghost" className="w-full">
					Product details
					<ChevronDownIcon className="ml-auto transition-transform group-data-[state=open]:rotate-180" />
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="flex flex-col items-start gap-2 p-2.5 pt-0 text-sm">
				<div>
					This panel can be expanded or collapsed to reveal additional content.
				</div>
				<Button size="xs">Learn More</Button>
			</CollapsibleContent>
		</Collapsible>
	);
}
