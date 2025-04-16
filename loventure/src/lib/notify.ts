import Notification from "@/models/Notification";

export async function sendNotification({
    userId,
    type,
    content,
    link,
} : {
    userId: string;
    type: "schedule" | "exchange_journal" | "quest";
    content: string;
    link?: string;
}) {
    await Notification.create({
        userId,
        type,
        content,
        link,
    });
}