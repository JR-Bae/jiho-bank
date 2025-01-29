import { createClient } from 'redis';

// Redis Cloud 연결
export const kv = createClient({
    username: 'default',
    password: 'y1w6o6O4rpprvZbIc2qAGBwzQG8kWfl1', // Redis Cloud 비밀번호
    socket: {
        host: 'redis-13290.c340.ap-northeast-2-1.ec2.redns.redis-cloud.com', // Redis Cloud 호스트
        port: 13290, // Redis Cloud 포트
    },
});

// 오류 핸들링
kv.on('error', (err) => console.error('❌ Redis Client Error:', err));

// Redis 연결 (Next.js 환경에서는 직접 실행 X)
(async () => {
    try {
        if (!kv.isOpen) await kv.connect();
        console.log('✅ Redis Cloud 연결 성공!');
    } catch (err) {
        console.error('🚨 Redis 연결 실패:', err);
    }
})();
