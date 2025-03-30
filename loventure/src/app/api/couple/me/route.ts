import Couple from "@/models/Couple";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

//GET /api/couple/me : 내 커플 정보 조회
export async function GET(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    // Check if couple exists
    const couple = await Couple.findById(user.coupleId);
    if(!couple) {
        return error("커플 정보를 찾을 수 없습니다.", 404);
    }

    // GET partner's info
    const users = await User
        .find({ _id: { $in: couple.users } })
        .select("_id nickname email profileImage");

    // Return partner's info
    return success("커플 정보를 불러왔습니다.", {
        couple: {
            _id: couple._id,
            startedDating: couple.startedDating,
            sharedGoals: couple.sharedGoals,
            sharedCode: couple.sharedCode,
            activeQuestIds: couple.activeQuestIds,
        },
        users,
    });
}