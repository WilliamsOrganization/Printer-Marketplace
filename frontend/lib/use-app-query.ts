import {
	useQuery,
	type UseQueryOptions,
	type UseQueryResult,
} from "@tanstack/react-query";
import { ensureSession } from "./api";

/**
 * Gates every other query in the app behind ensureSession() actually
 * resolving. staleTime: Infinity means this never spontaneously refetches
 * on its own - TanstackProvider.clear()s the whole cache when the
 * session's identity changes, which is what should trigger it to run again.
 */
export function useEnsureSessionQuery() {
	return useQuery({
		queryKey: ["ensure-session"],
		// ensureSession() resolves to undefined on success, but TanStack
		// Query treats an undefined queryFn result as an error ("Query data
		// cannot be undefined") - undefined is reserved to mean "no data
		// yet". Returning a real value keeps the side effect while giving
		// the query something valid to be isSuccess about.
		queryFn: async () => {
			await ensureSession();
			return true;
		},
		staleTime: Infinity,
	});
}

/**
 * Wraps useQuery so it can never run before ensureSession() has resolved.
 * Every data-fetching hook in the app should go through this instead of
 * calling useQuery directly - that's what makes the "wait for session"
 * behavior automatic instead of something every call site has to remember
 * to add itself (an explicit enabled: false still wins, so you can still
 * opt a specific query out further if you need to).
 */
export function useAppQuery<TData>(
	options: UseQueryOptions<TData>,
): UseQueryResult<TData> {
	const sessionQuery = useEnsureSessionQuery();
	return useQuery({
		...options,
		enabled: sessionQuery.isSuccess && (options.enabled ?? true),
	});
}
