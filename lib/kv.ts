import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: 'https://noble-bison-26037.upstash.io',
    token: 'AWW1AAIjcDFhYjc2Mjc0NTljMGQ0MzgxOTZiZTM3ZDE0MGYzMjkxMnAxMA',
})

export const kv = redis;