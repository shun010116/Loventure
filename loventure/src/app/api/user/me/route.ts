import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// GET /api/user/me : 로그인 상태 확인
export async function GET(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req);

    if (authError || !user) {
        return error(authError?.message || "인증되지 않았습니다.", authError?.status || 401);
  }

    return success("로그인된 유저 정보입니다.", {
        user: {
            _id: user._id,
            email: user.email,
            nickname: user.nickname,
            coupleId: user.coupleId,
            profileImage: user.profileImage,
            sharedCode: user.sharedCode,
        }
    });
}