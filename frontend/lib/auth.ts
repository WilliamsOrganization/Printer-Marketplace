import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import z from "zod";

const AuthResponseSchema = z.object({
	sessionToken: z.string(),
	userId: z.number(),
})
type AuthResponseSchema = z.infer<typeof AuthResponseSchema>;

const BACKEND_URL = process.env.SPRINGBOOT_BACKEND_URL || "http://backend:8080"
export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}
				const res = await fetch(`${BACKEND_URL}/server/auth/login`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: credentials.email,
						password: credentials.password,
					}),
				});
				if (!res.ok) return null;
				const parsed = AuthResponseSchema.safeParse(await res.json());
				if (!parsed.success) return null;

				return {
					id: String(parsed.data.userId),
					email: credentials.email,
					backendToken: parsed.data.sessionToken,
				};
			},
		}),
		CredentialsProvider({
			id: "guest",
			name: "Guest",
			credentials: {
				sessionToken: { type: "text" },
			},
			async authorize(credentials) {
				if (!credentials?.sessionToken) return null;
				return {
					id: "guest",
					backendToken: credentials.sessionToken,
				}
			}
		})
		,
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		AppleProvider({
			clientId: process.env.APPLE_CLIENT_ID!,
			clientSecret: process.env.APPLE_CLIENT_SECRET!,
		}),
	],
	session: {
		strategy: "jwt", // or "database"
	},
	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider === "google" || account?.provider === "apple") {
				// TODO: finish auth login route
				const res = await fetch(`${BACKEND_URL}/server/auth/login`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						provider: account?.provider,
						providerAccountID: account?.providerAccountId,
						email: user.email,
						name: user.name,
					}),
				});
				if (!res.ok) return false;
				const json = await res.json();
				const parsed = AuthResponseSchema.safeParse(json);
				if (!parsed.success) {
					console.log('invalid response recieved', parsed.error)
					return false;
				}
				user.backendToken = parsed.data.sessionToken;
				user.id = String( parsed.data.userId );
				return true;
			}
			if(account?.provider==="guest")return true;
			if(account?.provider==="credentials")return true;
			return false;
		},
		async jwt({ token, user, trigger, session }) {
			if (user) {
				console.log(`[auth] jwt callback: new sign-in, setting backendToken=${user.backendToken} userId=${user.id}`);
				token.id = user.id
				token.backendToken = user.backendToken;
				token.userId = user.id;
				if (user.phoneNumber) token.phoneNumber = user.phoneNumber;
			};
			// Fires when a client component calls useSession().update(...) -
			// `session` here is whatever was passed to update(), not the
			// full session object. Merge only what's present so a partial
			// update (e.g. just phoneNumber) doesn't clobber the other field.
			if (trigger === "update" && session) {
				if (session.email !== undefined) token.email = session.email;
				if (session.phoneNumber !== undefined) token.phoneNumber = session.phoneNumber;
			}
			return token;
		},
		async session({ session, token }) {
			console.log(`[auth] session callback: token.backendToken=${token.backendToken} token.userId=${token.userId}`);
			session.backendToken = token.backendToken as string;
			if (session.user) {
				session.user.id = token.userId as string;
				if (token.email) session.user.email = token.email as string;
				if (token.phoneNumber) session.user.phoneNumber = token.phoneNumber as string;
			}
			return session;
		},
	},
	pages: {
		signIn: "/login", // Custom sign-in page
	},
};
