import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    console.log("Headers:", req.headers);
    console.log("Cookies:", req.cookies.getAll());
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    console.log("token in middleware");
    console.log(token);


    const { pathname } = req.nextUrl;

    if (!token && pathname.startsWith("/chat")) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (token && pathname === "/") {
        return NextResponse.redirect(new URL("/chat", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/chat", "/((?!api/auth).*)"],
};
