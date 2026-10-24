import api from "./api";
import { Color } from "./types";
import { useAppQuery } from "./use-app-query";

// Every query under ["colors"] is invalidated when a color is created or changed.
export const COLORS_QUERY_KEY = ["colors"] as const;

/**
 * Every printing color that isn't deleted, including disabled ones (admin-only).
 * Backs the dashboard color card and the 3MF field dialog's color choices.
 */
export function useAdminColors() {
	return useAppQuery<Color[]>({
		queryKey: [...COLORS_QUERY_KEY, "admin"],
		queryFn: () => api.get("/colors/admin/all").then((res) => res.data),
	});
}
