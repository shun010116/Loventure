import UserQuest from "@/models/UserQuest";
import Character from "@/models/Character";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";
import { applyLevelUp } from "@/utils/checkLevelUp";

// PATCH /api/userQuest/:id/approve : 퀘스트 완료 승인 
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    const quest = await UserQuest.findById(params.id);
    if (!quest || quest.status !== "completed") {
        return error("승인할 수 없는 퀘스트입니다.", 400);
    }

    const receiverCharacter = await Character.findOne({ userId: quest.userId });
    const creatorCharacter = await Character.findOne({ userId: quest.createdBy });

    if (!receiverCharacter || !creatorCharacter) {
        return error("캐릭터 정보를 찾을 수 없습니다.", 400);
    }

    // 보상 지급
    receiverCharacter.exp += quest.reward.exp;
    receiverCharacter.gold += quest.reward.gold;

    creatorCharacter.lockedGold -= quest.reward.gold;

    applyLevelUp(receiverCharacter);

    await receiverCharacter.save();
    await creatorCharacter.save();

    quest.status = "approved";
    quest.approvedAt = new Date();
    await quest.save();

    return success("퀘스트가 승인되었습니다.");
}