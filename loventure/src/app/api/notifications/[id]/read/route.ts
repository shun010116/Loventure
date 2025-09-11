import Notification from "@/models/Notification";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);
    const { id } = await params;

    if (authError) {
        return error(authError.message, authError.status);
    }

    const notification = await Notification.findById(id);
    if (!notification || String(notification.userId) !== String(user._id)) {
        return error("권한이 없거나 알림을 찾을 수 없습니다.", 403);
    }

    if (!notification.isRead) {
        notification.isRead = true;
        await notification.save();
    }

    return success("알림을 읽었습니다.", {
        notification
    }
    );
}
