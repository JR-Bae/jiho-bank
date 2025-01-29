// lib/imageUtils.ts
export async function optimizeImage(file: File): Promise<Blob> {
    // 초기 파일이 4.5MB 이상인 경우 더 강한 압축 적용
    const needsHigherCompression = file.size > 4.5 * 1024 * 1024;

    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    // 파일 크기에 따른 동적 설정
    let maxDimension = 1600;
    let quality = 0.92;

    if (needsHigherCompression) {
        // 4.5MB 초과 파일에 대한 더 강한 최적화
        maxDimension = 1200;
        quality = 0.85;
    } else if (imageBitmap.width * imageBitmap.height > 8000000) { // 8MP 이상
        maxDimension = 1600;
        quality = 0.9;
    }

    // 가로세로 비율 유지하면서 크기 조절
    const scale = Math.min(maxDimension / imageBitmap.width, maxDimension / imageBitmap.height, 1);
    canvas.width = Math.round(imageBitmap.width * scale);
    canvas.height = Math.round(imageBitmap.height * scale);

    // 이미지 렌더링 품질 향상 설정
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

    // WebP 포맷으로 첫 번째 시도
    let optimizedBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/webp', quality)
    );

    // 만약 여전히 4.5MB를 초과한다면 추가 압축 시도
    if (optimizedBlob && optimizedBlob.size > 4.5 * 1024 * 1024) {
        quality -= 0.1; // 품질 10% 감소
        maxDimension = 1000; // 크기 추가 감소

        // 캔버스 크기 재조정
        const newScale = Math.min(maxDimension / imageBitmap.width, maxDimension / imageBitmap.height, 1);
        canvas.width = Math.round(imageBitmap.width * newScale);
        canvas.height = Math.round(imageBitmap.height * newScale);

        ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

        optimizedBlob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/webp', quality)
        );
    }

    if (!optimizedBlob) throw new Error('Image optimization failed');

    // 최종 크기가 4.5MB를 초과하면 에러
    if (optimizedBlob.size > 4.5 * 1024 * 1024) {
        throw new Error('Image is too large. Please try a smaller image.');
    }

    return optimizedBlob;
}