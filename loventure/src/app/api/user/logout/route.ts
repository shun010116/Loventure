export async function POST(req: Request) {
    try {
        // Clear the cookie by setting its expiration date to the past
        return new Response(JSON.stringify({ message: "로그아웃 성공" }), {
            status: 200,
            headers: {
                "Set-Cookie": `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;`,
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("로그아웃 실패:", error);
        return Response.json({ message: "서버 오류 발생" }, { status: 500 });
    }
}