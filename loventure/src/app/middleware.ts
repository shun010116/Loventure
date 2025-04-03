import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

const protectedPaths = [
    '/calender',
    '/diary',
    '/inventory',
    '/shop',
    '/myPage',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 보호된 경로가 아닐 시 통과
    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
    if (!isProtected) return NextResponse.next();

    // 쿠키에서 토큰 확인
    const token = request.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        jwt.verify(token, JWT_SECRET);
        return NextResponse.next();
    } catch (err) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
}