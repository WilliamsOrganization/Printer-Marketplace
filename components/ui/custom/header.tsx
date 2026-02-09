import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { ChevronDownIcon } from "lucide-react";
import { NavigationMenuDemo } from "./navigation";

export function Header() {
	return (
		<Collapsible className="group/drawer w-full">
			{/* Header bar */}
			<div className="flex items-center justify-between w-full px-4 py-2 border-b">
				<NavigationMenuDemo />
				<CollapsibleTrigger asChild>
					<Button variant="ghost">
						Product details
						<ChevronDownIcon className="ml-2 h-4 w-4 transition-transform group-data-[state=open]/drawer:rotate-180" />
					</Button>
				</CollapsibleTrigger>
			</div>
			{/* Collapsible content below the entire header */}
			<CollapsibleContent className="w-full border-b bg-muted p-4">
				<div className="text-sm">
					This panel can be expanded or collapsed to reveal additional content.
				</div>
				<Button size="xs" className="mt-2">Learn More</Button>
			</CollapsibleContent>
		</Collapsible>
	);
}
export default Header;
