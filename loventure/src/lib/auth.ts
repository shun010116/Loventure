import jwt from "jsonwebtoken";
import User from "@/models/User";
import { dbConnect } from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

/**
 * 로그인 된 유저를 가져오는 함수
 * @params req - Next.js API 요청 객체
 * @params requireCouple - 커플 연결 여부 검사 (default: false)
 * @returns user 또는 error 객체
 */
export async function getAuthenticatedUser(req: Request, requireCouple = false) {
    await dbConnect();
        
    // Get token from cookie
    const cookie = req.headers.get("cookie") || "";
    
    // Parse the cookie to get the token
    const token = cookie
        .split(";")
        .find((c) => c.trim().startsWith("token="))
        ?.split("=")[1];

    // Check if token exists
    if (!token) {
        return { erorr: { message: "로그인이 필요합니다.", status: 401 } };
    }

    // Verify the token
    let decoded: any;
    try {   
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        //console.error("Token verification failed:", error);
        return { error: { message: "유효하지 않은 토큰입니다.", status: 401 } };
    }

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
        return { error: { message: "유효하지 않은 유저입니다.", status: 404 } };
    }

    // Check if user has coupleId
    if (requireCouple && !user.coupleId) {   
        return { error: { message: "커플이 아닙니다.", status: 400 } };
    }

    return { user };
}