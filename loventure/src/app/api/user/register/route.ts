import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import Character from "@/models/Character";
import bcrypt from "bcrypt";
import { success, error } from "@/utils/response";
import { generateUniqueCoupleCode } from "@/utils/generateUniqueCoupleCode";
import { INITIAL_CHARACTERS } from "@/constants/characters";
import { getRandomItem } from "@/utils/random";

// POST /api/user/register : 회원가입
export async function POST(req: Request) {
    const { email, password, nickname } = await req.json();

    try {
        await dbConnect();

        // check required fields
        if (!email || !password || !nickname) {
            return error("모든 항목을 입력해주세요.", 400);
        }

        // check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return error("이미 가입된 이메일입니다.", 400);
        }
        
        // check password condition
        if (password.length < 6) {
            return error("비밀번호는 최소 6자 이상이어야 합니다.", 400);
        }

        // hash password
        const passwordHash = await bcrypt.hash(password, 10);
        // generate unique shared code
        const sharedCode = await generateUniqueCoupleCode();

        // create new user
        const newUser = new User({
            email,
            passwordHash,
            nickname,
            profileImage: "",
            sharedCode,
        });

        await newUser.save();
        //console.log("받은 값:", email, password, nickname);
        //console.log("저장된 유저:", newUser);

        // create Character
        const randomCharacter = getRandomItem(INITIAL_CHARACTERS);
        const newCharacter = await Character.create({
            userId: newUser._id,
            name: nickname,
            avatar: randomCharacter.sprite,
        });

        return success("회원가입이 완료되었습니다.", {
            userId: newUser._id
        });
    } catch (err) {
        //console.error("회원가입 실패:", err);
        return error("서버 오류 발생", 500);
    }
}
