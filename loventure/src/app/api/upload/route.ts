// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  path  from 'path';
import fs from 'fs/promises';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    // 서버 내부 경로 설정
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, fileName);

    try {
        // uploads 디렉토리가 없으면 생성
        await fs.mkdir(uploadDir, { recursive: true });
        // 파일 저장
        await fs.writeFile(filePath, buffer);
    } catch (err) {
        console.error("Error writing file:", err);
        return NextResponse.json({ message: "File upload failed" }, { status: 500 });
    }

    // 파일 경로 반환
    return NextResponse.json({
        message: "File uploaded successfully",
        url: `/uploads/${fileName}`,
    });
}
