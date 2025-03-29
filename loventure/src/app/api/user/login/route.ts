import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { success, error } from "@/utils/response";

const JWT_SECRET = process.env.JWT_SECRET as string;
const COOKIE_EXPIRES_IN = 60 * 60 * 6; // 6시간

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

// POST /api/user/login : 로그인 + JWT 발급
export async function POST(req: Request) {
    try {
        await dbConnect();

        const { email, password } = await req.json();
        if(!email || !password) {
            return error("모든 항목을 입력해주세요.", 400);
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return error("해당 이메일이 존재하지 않습니다.", 401);
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return error("비밀번호가 일치하지 않습니다.", 401);
        }

        // login success
        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                nickname: user.nickname,
                email: user.email,
            },
            JWT_SECRET,
            { expiresIn: COOKIE_EXPIRES_IN }
        );

        // Set token in cookie
        return new Response(JSON.stringify({
            success: true,
            message: "로그인 성공",
            user : {
                _id: user._id,
                email: user.email,
                nickname: user.nickname,
            }
        }), {
            status: 200,
            headers: {
                "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=${COOKIE_EXPIRES_IN}; SameSite=Strict;`,
                "Content-Type": "application/json",
            },
        });
    } catch (err) {
        //console.error("로그인 실패:", err);
        return error("서버 오류 발생", 500);
    }
}