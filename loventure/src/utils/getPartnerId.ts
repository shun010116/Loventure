import Couple from "@/models/Couple";
import { Types } from "mongoose";

/**
 * 현재 유저 ID와 커플 ID를 기반으로 파트너 ID를 가져오는 함수
 * @param userId 현재 로그인한 유저의 ObjectId (string or ObjectId)
 * @param coupleId 유저가 속한 커플의 ObjectId (string or ObjectId)
 * @returns 파트너의 ObjectId (string) | null
 */
export async function getPartnerId(userId: string | Types.ObjectId, coupleId: string | Types.ObjectId): Promise<string | null> {
    try {
        const couple = await Couple.findById(coupleId).select("users");
        if (!couple || !couple.users || couple.users.length !== 2) return null;

        const userIdStr = userId.toString();
        const partnerId = couple.users.find((id: Types.ObjectId) => id.toString() !== userIdStr);
        
        //console.log("Partner ID:", partnerId.toString());

        return partnerId?.toString() || null;
    } catch (err) {
        console.error("Error fetching partner Id:", err);
        return null;
    }
}