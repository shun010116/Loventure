import CoupleQuest from "@/models/CoupleQuest";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// PATCH /api/coupleQuest/:id/progress : 커플 퀘스트 진행도 업데이트
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const { user, error: authError } = await getAuthenticatedUser(req);

    if (authError) {
        return error(authError.message, authError.status);
    }

    const quest = await CoupleQuest.findById(params.id);

    if (!quest || quest.coupleId !== user.coupleId) {
        return error("퀘스트를 찾을 수 없거나 접근 권한이 없습니다.", 404);
    }

    const { increment = 1 } = await req.json();

    if (quest.isCompleted) {
        return error("이미 완료된 퀘스트입니다.", 400);
    }

    quest.currentValue += increment;

    if (quest.currentValue >= quest.targetValue) {
        quest.isCompleted = true;
        quest.completedAt = new Date();
    }

    quest.updatedAt = new Date();
    await quest.save();

    return success("커플 퀘스트 진행도가 업데이트 되었습니다.", {
        isCompleted: quest.isCompleted,
        currentValue: quest.currentValue,
        targetValue: quest.targetValue,
    });
}