import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

const apiServer = axios.create({
	baseURL: process.env.SPRINGBOOT_BACKEND_URL + "/server",
	headers: {
		"Content-Type": "application/json",
	},
});

apiServer.interceptors.request.use(async (config) => {
	const session = await getServerSession(authOptions);
	if (session?.backendToken) {
		config.headers.Authorization = `Bearer ${session.backendToken}`;
		console.log(`[apiServer] ${config.method?.toUpperCase()} ${config.url} -> session token ${session.backendToken}`);
	} else {
		console.log(`[apiServer] ${config.method?.toUpperCase()} ${config.url} -> no session/backendToken from getServerSession`);
	}
	return config;
});

export default apiServer;
