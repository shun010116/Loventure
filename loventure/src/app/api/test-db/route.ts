// src/app/api/test-db/route.ts
import { dbConnect } from "@/lib/mongodb";

export async function GET() {
    try {
        await dbConnect();
        return Response.json({ status: "Success - Connected to DB" });
    } catch (error) {
        console.error("DB connection error:", error);
        return Response.json({ status: "Error - DB connection failed", error: String(error) }, { status: 500 });
    }
}