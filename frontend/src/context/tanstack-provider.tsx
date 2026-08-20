"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEnsureSessionQuery } from "@/lib/use-app-query";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

/**
 * Mounting this anywhere is the entire bootstrap mechanism: useQuery fires
 * its queryFn automatically on mount, with no manual effect or ref-guard
 * needed - that IS the single blocking request for the whole app. Every
 * other query (via useAppQuery) references this exact same cache key
 * (["ensure-session"]) and TanStack de-dupes them into one shared request
 * no matter how many components ask for it simultaneously, then simply
 * waits on it via `enabled`.
 */
function SessionGate({ children }: { children: React.ReactNode }) {
	useEnsureSessionQuery();
	return <>{children}</>;
}

/**
 * TanstackProvider sets up the React Query client for the whole app, and
 * clears the query cache whenever the session's identity actually changes.
 *
 * Clearing the cache on identity change matters because query data is
 * keyed by things like ["cart"], not by user - without this, switching
 * from one account to another (login, logout, or a guest token getting
 * replaced) would keep serving the previous identity's cached cart/orders
 * until something happened to refetch them.
 */
export function TanstackProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());
	const { data: session } = useSession();
	const previousToken = useRef<string | undefined>(undefined);

	useEffect(() => {
		const currentToken = session?.backendToken;
		if (previousToken.current !== undefined && previousToken.current !== currentToken) {
			queryClient.clear();
		}
		previousToken.current = currentToken;
	}, [session?.backendToken, queryClient]);

	return (
		<QueryClientProvider client={queryClient}>
			<SessionGate>{children}</SessionGate>
		</QueryClientProvider>
	);
}
