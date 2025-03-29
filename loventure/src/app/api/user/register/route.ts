import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const { email, password, nickname } = await req.json();

        // check required fields
        if (!email || !password || !nickname) {
            return Response.json({ message: "모든 항목을 입력해주세요." }, { status: 400 });
        }

        // check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return Response.json({ message: "이미 가입된 이메일입니다." }, { status: 409 });
        }

        // hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // create new user
        const newUser = new User({
            email,
            passwordHash,
            nickname,
            profileImage: "",
        });

        await newUser.save();
        //console.log("받은 값:", email, password, nickname);
        //console.log("저장된 유저:", newUser);

        return Response.json({ message: "회원가입이 완료되었습니다.", userId: newUser._id });
    } catch (error) {
        console.error("회원가입 실패:", error);
        return Response.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}
