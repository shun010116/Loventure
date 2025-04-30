import CoupleQuest from "@/models/CoupleQuest";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// PATCH /api/coupleQuest/:id/agree : 커플 퀘스트 동의 처리
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const { user, error: authError } = await getAuthenticatedUser(req);

    if (authError) {
        return error(authError.message, authError.status);
    }

    const quest = await CoupleQuest.findById(params.id);

    if (!quest || String(quest.coupleId) !== String(user.coupleId)) {
        return error("퀘스트를 찾을 수 없거나 접근 권한이 없습니다.", 404);
    }

    if (quest.agreed) {
        return error("이미 동의한 퀘스트입니다.", 400);
    }

    quest.agreed = true;
    quest.updatedAt = new Date();
    await quest.save();

    return success("커플 퀘스트에 동의했습니다.", {
        questId: quest._id,
    });
}