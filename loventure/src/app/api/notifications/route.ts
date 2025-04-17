// GET /api/notifications
import { getAuthenticatedUser } from "@/lib/auth";
import Notification from "@/models/Notification";
import { success, error } from "@/utils/response";

export async function GET(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req);

    if (authError) {
        return error(authError.message, authError.status);
    }

    const notifications = await Notification.find({ userId: user._id })
        .sort({ createdAt: -1 });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return success("알림이 있습니다.", {
        notifications,
        unreadCount
    });
}