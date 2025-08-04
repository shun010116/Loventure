import CoupleQuest from "@/models/CoupleQuest";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// PATCH /api/coupleQuest/:id : 커플 퀘스트 수정
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    const quest = await CoupleQuest.findById(params.id);

    if(!quest || String(quest.coupleId) !== String(user.coupleId)) {
        return error("퀘스트를 찾을 수 없거나 접근 권한이 없습니다.", 404);
    }

    const {
        title,
        description,
        goalType,
        resetType,
        targetValue,
    } = await req.json();

    // 수정 가능한 필드만 업데이트
    if (title !== undefined) quest.title = title;
    if (description !== undefined) quest.description = description;
    if (goalType !== undefined) quest.goalType = goalType;
    if (resetType !== undefined) quest.resetType = resetType;
    if (targetValue !== undefined) quest.targetValue = targetValue;

    quest.updatedAt = new Date();
    await quest.save();

    return success("커플 퀘스트가 수정되었습니다.", {
        questId: quest._id,
    });
}

// DELETE /api/coupleQuest/:id : 커플 퀘스트 삭제
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }
    
    const quest = await CoupleQuest.findById(params.id);

    if (!quest || String(quest.coupleId) !== String(user.coupleId)) {
        return error("퀘스트를 찾을 수 없거나 접근 권한이 없습니다.", 404);
    }

    await quest.deleteOne();

    return success("커플 퀘스트가 삭제되었습니다.");
}