import Couple from "@/models/Couple";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// POST /api/couple/join : 커플 코드로 커플 등록하기
export async function POST(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req);

    if (authError) {
        return error(authError.message, authError.status);
    }

    // Check if Couple already exists
    if (user.coupleId) {
        return error("이미 커플입니다.", 400);
    }

    // Get shared code from request body
    const { sharedCode } = await req.json();
    if (!sharedCode) {
        return error("커플 코드를 입력해야합니다.", 400);
    }

    // Check if couple valid
    const couple = await Couple.findOne({ sharedCode });
    if (!couple) {
        return error("유효하지 않은 커플 코드입니다.", 404);
    }
    if (couple.users.length >=2) {
        return error("이미 커플이 연결되어 있습니다.", 400);
    }

    // Add user to couple
    couple.users.push(user._id);
    await couple.save();

    // Update user with coupleId
    user.coupleId = couple._id;
    await user.save();

    // Return couple info
    return success("커플이 성공적으로 등록되었습니다.", {
        coupleId: couple._id,
    });
}