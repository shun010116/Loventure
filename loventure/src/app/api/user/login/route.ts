// POST /api/user/login 로그인 + JWT 발급

import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

export async function POST(req: Request) {
    try {
        await dbConnect();

        const { email, password } = await req.json();

        if(!email || !password) {
            return Response.json({ message: "모든 항목을 입력해주세요." }, { status: 400 });
        }

        const user = await User.findOne({ email });
        // Check if user exists
        if (!user) {
            return Response.json({ message: "해당 이메일이 존재하지 않습니다." }, { status: 401 });
        }
        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return Response.json({ message: "비밀번호가 일치하지 않습니다." }, { status: 401 });
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
            { expiresIn: "12h" }
        );

        // Set token in cookie
        return new Response(JSON.stringify({
            message: "로그인 성공",
            user : {
                _id: user._id,
                email: user.email,
                nickname: user.nickname,
            }
        }), {
            status: 200,
            headers: {
                "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=43200; SameSite=Strict;`,
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("로그인 실패:", error);
        return Response.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}