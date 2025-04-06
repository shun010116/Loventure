import Couple from "@/models/Couple";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// POST /api/couple/join : 커플 코드로 커플 등록하기
export async function POST(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req);

    if (authError) {
        return error(authError.message, authError.status);
    }

    // Get shared code from request body
    const { sharedCode } = await req.json();
    if (!sharedCode) {
        return error("커플 코드를 입력해야합니다.", 400);
    }

    // Check if Couple already exists
    if (user.coupleId) {
        return error("이미 커플입니다.", 400);
    }

    // Normalize shared code
    const normalizedCode = sharedCode.toLowerCase();

    // Find partner by shared code
    const partner = await User.findOne({ 
        sharedCode: { $regex: new RegExp(`^${normalizedCode}$`, "i") },
    });
    if (!partner) return error("유효하지 않은 커플 코드입니다.", 404);
    if (partner._id.equals(user._id)) return error("본인의 코드입니다.", 400);
    if (partner.coupleId) return error("상대방은 이미 커플입니다.", 400);

    // Generate Couple
    const couple = await Couple.create({ users: [partner._id, user._id] });

    // Update coupleId for both users    
    partner.coupleId = couple._id;
    user.coupleId = couple._id;

    await partner.save();
    await user.save();

    // Return couple info
    return success("커플이 성공적으로 등록되었습니다.", {
        coupleId: couple._id,
    });
}