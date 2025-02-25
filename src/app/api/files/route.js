import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchUserPDFs } from "@/app/backend/services/vectorStore.js";

export const GET = async () => {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const files = await fetchUserPDFs(userId);

        return NextResponse.json({ success: true, files });
    } catch (error) {
        console.error("Fetch Files Error:", error);
        return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
    }
};
