import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/backend/lib/auth";
import { deletePDF } from "@/app/backend/services/vectorStore.js";

export const DELETE = async () => {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        await deletePDF(userId, true);

        return NextResponse.json({ success: true, message: "File deleted successfully" });
    } catch (error) {
        console.error("Delete File Error:", error);
        return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }
};
