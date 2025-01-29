// lib/imageUtils.ts
export async function optimizeImage(file: File): Promise<Blob> {
    let maxDimension = 1200; // 시작 크기
    let attempts = 0;
    let optimizedBlob: Blob | null = null;

    while (attempts < 5) { // 최대 5번 시도
        const imageBitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

        const scale = Math.min(
            maxDimension / imageBitmap.width,
            maxDimension / imageBitmap.height,
            1
        );

        canvas.width = Math.round(imageBitmap.width * scale);
        canvas.height = Math.round(imageBitmap.height * scale);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

        optimizedBlob = await new Promise<Blob | null>(resolve =>
            canvas.toBlob(resolve, 'image/png')
        );

        if (!optimizedBlob) {
            throw new Error('Image optimization failed');
        }

        // 500KB = 512,000 bytes
        if (optimizedBlob.size <= 512000) {
            break;
        }

        // 파일이 여전히 크면 크기를 20% 줄임
        maxDimension = Math.floor(maxDimension * 0.8);
        attempts++;
    }

    if (!optimizedBlob || optimizedBlob.size > 512000) {
        throw new Error('Could not optimize image to under 500KB. Please try a smaller image.');
    }

    return optimizedBlob;
}