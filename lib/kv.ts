import { createClient } from 'redis';

// Redis Cloud 연결
export const kv = createClient({
    username: 'default',
    password: 'PtIvkkn9D4FAJcYZr7adMsMS3oIcPsRI', // Redis Cloud 비밀번호
    socket: {
        host: 'redis-13622.c279.us-central1-1.gce.redns.redis-cloud.com', // Redis Cloud 호스트
        port: 13622, // Redis Cloud 포트
    },
});
//redis-cli -u redis://default:PtIvkkn9D4FAJcYZr7adMsMS3oIcPsRI@redis-13622.c279.us-central1-1.gce.redns.redis-cloud.com:13622
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
