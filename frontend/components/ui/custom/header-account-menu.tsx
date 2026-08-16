"use client";

import { IconLogout, IconUserCircle } from "@tabler/icons-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Account entry point in the middle of the site header - mirrors the
 * NavUser icon used in the admin sidebar. Signed-out visitors get a
 * straight link to /login; signed-in users get a dropdown with sign out.
 */
export function HeaderAccountMenu() {
	const { data: session, status } = useSession();
	// Every guest cart bootstraps a "guest" NextAuth session (see
	// api.ts/add-to-cart-button.tsx) so status is "authenticated" for
	// visitors who never actually logged in - only a real account counts here.
	const isLoggedIn = status === "authenticated" && session?.user?.id !== "guest";

	if (!isLoggedIn) {
		return (
			<Button variant="ghost" size="icon" asChild>
				<Link href="/login" aria-label="Log in">
					<IconUserCircle className="size-5" />
				</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Account">
					<IconUserCircle className="size-5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center" sideOffset={4}>
				<DropdownMenuLabel className="truncate font-normal text-muted-foreground">
					{session?.user?.email}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/" })}>
					<IconLogout />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
