import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getMongoDBAdapter } from "../../../lib/nextAuthMongo";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    adapter: await getMongoDBAdapter(),
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id; // Attach user ID to JWT
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id; // Pass user ID to session
            }
            return session;
        },
        async signIn() {
            return true;
        },
        async redirect() {
            return "/chat";
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
