import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

export async function GET(req: Request) {
    // 1. Get token from cookie
    const cookie = req.headers.get("cookie") || "";
    
    // 2. Parse the cookie to get the token
    const token = cookie
        .split(";")
        .find((c) => c.trim().startsWith("token="))
        ?.split("=")[1];

    // 3. Check if token exists
    if (!token) {
        return Response.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    // 4. Verify the token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // 5. Return user info
        return Response.json({ user: decoded });
    } catch (error) {
        //console.error("Token verification failed:", error);
        return Response.json({ message: "유효하지 않은 토큰입니다." }, { status: 401 });
    }

}