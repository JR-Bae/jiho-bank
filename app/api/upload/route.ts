// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename');

        if (!filename) throw new Error('Filename is required');

        // request.body가 null이 아님을 확인
        if (!request.body) {
            throw new Error('Request body is required');
        }

        // Blob으로 변환
        const blob = await request.blob();

        const uploadedBlob = await put(filename, blob, {
            access: 'public',
        });

        return NextResponse.json(uploadedBlob);
    } catch (e) {
        // error 변수 사용
        const error = e as Error;
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};