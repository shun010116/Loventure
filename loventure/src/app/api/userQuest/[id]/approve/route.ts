import UserQuest from "@/models/UserQuest";
import Character from "@/models/Character";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";
import { applyLevelUp } from "@/utils/checkLevelUp";

const normId = (v: any) => String(v?._id ?? v);

// PATCH /api/userQuest/:id/approve : 퀘스트 완료 승인 
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const { user, error: authError } = await getAuthenticatedUser(req, true);
        const { id } = params;
    
        if (authError) {
            return error(authError.message, authError.status);
        }
    
        const quest = await UserQuest.findById(id);
        if (!quest || quest.status !== "completed") {
            return error("승인할 수 없는 퀘스트입니다.", 400);
        }
    
        const receiverCharacter = await Character.findOne({ userId: quest.userId });
        const creatorCharacter = await Character.findOne({ userId: quest.createdBy });
    
        if (!receiverCharacter || !creatorCharacter) {
            return error("캐릭터 정보를 찾을 수 없습니다.", 400);
        }
    
        // 보상 지급
        const { exp = 0, gold = 0 } = quest.reward ?? {};
        receiverCharacter.exp += exp;
        receiverCharacter.gold += gold;        

        const receiverId = normId(quest.userId);
        const creatorId  = normId(quest.createdBy);

        const sameUser = receiverId === creatorId;
        
        if (!sameUser) {
            const currentLocked = Number(creatorCharacter.lockedGold ?? 0);
            const dec = Number(gold ?? 0);
            creatorCharacter.lockedGold = Math.max(0, currentLocked - dec);
        }
    
        const result = applyLevelUp(receiverCharacter);
    
        await receiverCharacter.save();
        await creatorCharacter.save();
    
        quest.status = "approved";
        quest.approvedAt = new Date();
        await quest.save();
    
        return success("퀘스트가 승인되었습니다.", {
            questId: quest._id,
            reward: { exp, gold },
            character: {
                _id: receiverCharacter._id,
                level: receiverCharacter.level,
                exp: receiverCharacter.exp,
                gold: receiverCharacter.gold,
                evolutionStage: receiverCharacter.evolutionStage,
            },
            evolution: result.evolved
                ? {
                    evolved: true,
                    prevLevel: result.prevLevel,
                    newLevel: result.newLevel,
                    prevStage: result.prevStage,
                    newStage: result.newStage,
                }
            : { evolved: false },
        });
    } catch (e) {
        console.error(e);
        return error("승인 처리 중 오류가 발생했습니다.", 500);
    }
}
