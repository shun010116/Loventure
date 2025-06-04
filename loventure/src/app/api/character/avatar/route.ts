import Character from "@/models/Character";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// PATCH /api/character/avatar
export async function PATCH(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);
    if (authError) {
        return error(authError.message, authError.status);
    }

    const { avatar } = await req.json();

    const character = await Character.findOne({ userId: user._id });
    if (!character) return error("캐릭터를 찾을 수 없습니다.", 404);

    character.avatar = avatar;
    await character.save();

    return success("Updated characcter avatar successfully.", {
        avatar: character.avatar,
    });
}