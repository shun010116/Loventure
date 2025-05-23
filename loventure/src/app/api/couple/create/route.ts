import Couple from "@/models/Couple";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// POST /api/couple/create : 커플 생성
export async function POST(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req);

    if (authError) {
        return error(authError.message, authError.status);
    }

    if (user.coupleId) {
        return error("이미 커플로 연결되어 있습니다.", 400);
    }

    // Create couple
    const newCouple = await Couple.create({
        users: [user._id],
    });

    // Update user with coupleId
    user.coupleId = newCouple._id;
    await user.save();

    // Return couple info
    return success("커플이 생성되었습니다.", {
        coupleId: newCouple._id,
        sharedCode: newCouple.sharedCode,
    });
}