import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import axios from "axios";
import { getSession, signIn } from "next-auth/react";

const apiSession = axios.create({
	baseURL: "/server",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
})

apiSession.interceptors.request.use(async (config) => {
	const session = await getSession();
	if (session?.backendToken) {
		config.headers.Authorization = `Bearer ${session.backendToken}`;
	} else {
		const guestToken = localStorage.getItem("guestToken");
		if (guestToken) {
			config.headers.Authorization = `Bearer ${guestToken}`;
		}
	}
	return config;
})

// The backend may transparently create a new guest account/session on any
// request that arrives with no recognizable token (see SessionAuthFilter /
// UserService.getUserFromSession). When that happens it echoes the new
// token back via this header - without persisting it here, that identity
// would be unreachable and the very next request would trigger another new
// account, indefinitely.
apiSession.interceptors.response.use(async (response) => {
	const newToken = response.headers["x-session-token"];
	if (newToken) {
		localStorage.setItem("guestToken", newToken);
		const session = await getSession();
		if (!session?.backendToken) {
			await signIn("guest", { sessionToken: newToken, redirect: false });
		}
	}
	return response;
})

export default apiSession;

