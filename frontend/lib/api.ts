import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import axios from "axios";

async function getServerApi() {
	const session = await getServerSession(authOptions);

	return axios.create({
		baseURL: process.env.BACKEND_URL,
		headers: {
			"ContentType": "application/json",
			...(session?.accessToken && {
				authorization: `Bearer ${session.accessToken}`)
		}
	});
}

