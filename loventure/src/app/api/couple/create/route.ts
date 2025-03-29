import Couple from "@/models/Couple";
import { generateUniqueCoupleCode } from "@/utils/generateUniqueCoupleCode";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// POST /api/couple/create : 커플 생성
export async function POST(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req);

    if (authError) {
        return error(authError.message, authError.status);
    }

    if (user.coupleId) {
        return error("이미 커플로 연결된 유저입니다.", 400);
    }

    // 1. Create couple
    const sharedCode = await generateUniqueCoupleCode();

    const newCouple = await Couple.create({
        users: [user._id],
        sharedCode,
    });

    // 2. Update user with coupleId
    user.coupleId = newCouple._id;
    await user.save();

    // 3. Return couple info
    return success("커플이 생성되었습니다.", {
        coupleId: newCouple._id,
        sharedCode: newCouple.sharedCode,
    });
}