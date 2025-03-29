import { generateCoupleCode } from "./generateCode";
import Couple from "@/models/Couple";

/**
 * DB에 저장된 커플 코드와 중복되지 않는 커플 코드를 생성합니다.
 * @param length 커플 코드의 길이 (기본값: 6)
 */ 
export async function generateUniqueCoupleCode(length = 6): Promise<string> {
    let code: string;
    let exists = true;

    while (exists) {
        code = generateCoupleCode(length);
        // 커플 코드가 DB에 존재하는지 확인
        const existing = await Couple.findOne({ sharedCode: code });
        exists = !!existing;
    }

    return code!;
}