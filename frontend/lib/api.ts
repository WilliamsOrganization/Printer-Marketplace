import axios from "axios";
import { getSession, signIn } from "next-auth/react";

const apiSession = axios.create({
	baseURL: "/server",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
})

const WHOAMI_PATH = "/session/whoami";

// Shared, de-duplicated in-flight bootstrap. Every request in the app goes
// through the request interceptor below and awaits this same promise when
// there's no session yet - so if multiple components (CartProvider,
// DashboardProvider, AnonymousProvider, etc.) all try to fire a request
// before any identity exists, only the first one actually starts the
// bootstrap; everyone else just waits on that same result instead of each
// minting their own throwaway guest session.
let ensureSessionPromise: Promise<void> | null = null;

export async function ensureSession(): Promise<void> {
	const session = await getSession();
	if (session?.backendToken) return;
	if (!ensureSessionPromise) {
		ensureSessionPromise = (async () => {
			const res = await apiSession.get(WHOAMI_PATH);
			const newToken = res.data.sessionToken;
			if (newToken) {
				await signIn("guest", { sessionToken: newToken, redirect: false });
			}
		})().finally(() => {
			ensureSessionPromise = null;
		});
	}
	return ensureSessionPromise;
}

apiSession.interceptors.request.use(async (config) => {
	// The whoami call itself must skip this, or it would wait forever on
	// the very promise it's supposed to be fulfilling.
	if (config.url !== WHOAMI_PATH) {
		await ensureSession();
	}
	const session = await getSession();
	if (session?.backendToken) {
		config.headers.Authorization = `Bearer ${session.backendToken}`;
		console.log(`[api] ${config.method?.toUpperCase()} ${config.url} -> session token ${session.backendToken}`);
	} else {
		console.log(`[api] ${config.method?.toUpperCase()} ${config.url} -> no token available`);
	}
	return config;
})

export default apiSession;

