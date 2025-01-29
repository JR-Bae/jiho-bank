import { put } from '@vercel/blob';

export const uploadToBlob = async (file: File): Promise<string> => {
    const optimizedFile = await optimizeImage(file);
    const { url } = await put(`uploads/${file.name}`, optimizedFile, {
        access: 'public',
    });
    return url;
};

// 이미지 최적화 함수
async function optimizeImage(file: File): Promise<Blob> {
    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const scale = Math.min(800 / imageBitmap.width, 800 / imageBitmap.height, 1);
    canvas.width = imageBitmap.width * scale;
    canvas.height = imageBitmap.height * scale;

    ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

    const optimizedBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.8) // JPEG 포맷, 품질 80%
    );

    if (!optimizedBlob) throw new Error('Image optimization failed');
    return optimizedBlob;
}
