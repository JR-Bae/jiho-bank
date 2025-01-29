/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // Cloudflare Pages 호환 모드
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
                port: '',
                pathname: '/uploads/**',
            },
        ],
    },
};

export default nextConfig;