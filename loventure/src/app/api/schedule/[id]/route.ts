import Schedule from "@/models/Schedule";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// PUT /api/schedule/:id : 일정 수정
export async function PUT(req: Request, context: { params: { id: string } }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    const scheduleId = context.params.id;
    const schedule = await Schedule.findById(scheduleId);

    // Check schedule exists
    if (!schedule || String(schedule.coupleId) !== String(user.coupleId)) {
        return error("일정을 찾을 수 없습니다.", 404);
    }

    // Compare id
    const isParticipant = schedule.participants.map(String).includes(String(user._id));
    if (!isParticipant) return error("수정 권한이 없습니다.", 403);

    // Wait input
    const {
        title,
        description,
        startDate,
        endDate,
        repeat,
        participants,
        isCompleted,
    } = await req.json();

    // Change values
    if (title !== undefined) schedule.title = title;
    if (description !== undefined) schedule.description = description;
    if (startDate !== undefined) schedule.startDate = new Date(startDate);
    if (endDate !== undefined) schedule.endDate = new Date(endDate);
    if (repeat !== undefined) schedule.repeat = repeat;
    if (participants !== undefined) schedule.participants = participants;
    if (isCompleted !== undefined) schedule.isCompleted = isCompleted;

    // Patch schedule
    schedule.updatedAt = new Date();
    await schedule.save();

    // Return schedule
    return success("일정이 수정되었습니다.", {
        schedule,
    });
}

// DELETE /api/schedule/:id : 일정 삭제
export async function DELETE(req: Request, context: { params: { id: string } }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    const scheduleId = context.params.id;
    const schedule = await Schedule.findById(scheduleId);

    // Check schedule exists
    if (!schedule || String(schedule.coupleId) !== String(user.coupleId)) {
        return error("일정을 찾을 수 없습니다.", 404);
    }

    // Compare Id
    const isParticipant = schedule.participants.map(String).includes(String(user._id));
    if (!isParticipant) return error("삭제 권한이 없습니다.", 403);

    // Delete schedule
    await Schedule.deleteOne({ _id: schedule._id });

    // Return schedule
    return success("일정이 삭제되었습니다.");
}