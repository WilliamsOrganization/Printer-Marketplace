import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import axios from "axios";
import { getSession } from "next-auth/react";

const BACKEND_URL= process.env.SPRINGBOOT_BACKEND_URL || "http://backend:8080" // TODO: check this is the proper url

async function getServerApi() {
	const session = await getSession();

	return axios.create({
		baseURL: process.env.BACKEND_URL,
		headers: {
			ContentType: "application/json",
			...(session?.backendToken && {
				authorization: `Bearer ${session.backendToken}`,
			}),
		},
	});
}
