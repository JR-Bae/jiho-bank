// lib/imageUtils.ts
export async function optimizeImage(file: File): Promise<Blob> {
    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    // 이미지 크기에 따른 동적 스케일 계산
    let maxDimension = 1600; // 기본 최대 크기
    let quality = 0.9;      // 기본 품질

    // 파일 크기가 1MB 이상인 경우 추가 최적화
    if (file.size > 1024 * 1024) {
        maxDimension = 1200;
        quality = 0.85;
    }

    const scale = Math.min(
        maxDimension / imageBitmap.width,
        maxDimension / imageBitmap.height,
        1
    );

    canvas.width = Math.round(imageBitmap.width * scale);
    canvas.height = Math.round(imageBitmap.height * scale);

    // 이미지 렌더링 품질 향상
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

    // PNG 포맷으로 변환
    const optimizedBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
            (blob) => {
                // PNG로 변환했는데도 4.5MB 이상이면 JPG로 재시도
                if (blob && blob.size > 4.5 * 1024 * 1024) {
                    canvas.toBlob(
                        resolve,
                        'image/jpeg',
                        0.85
                    );
                } else {
                    resolve(blob);
                }
            },
            'image/png'
        );
    });

    if (!optimizedBlob) throw new Error('Image optimization failed');

    // 최종 크기가 4.5MB를 초과하면 에러
    if (optimizedBlob.size > 4.5 * 1024 * 1024) {
        throw new Error('Image is too large. Please try a smaller image.');
    }

    return optimizedBlob;
}