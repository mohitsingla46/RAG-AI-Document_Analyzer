import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { getMongoDBAdapter } from '../../../lib/nextAuthMongo';

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    adapter: await getMongoDBAdapter(),
    session: { strategy: "jwt" },
    callbacks: {
        async signIn() {
            return true;
        },
        async redirect() {
            return "/chat";
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }