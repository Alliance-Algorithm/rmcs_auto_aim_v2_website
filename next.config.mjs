/** @type {import('next').NextConfig} */

const nextConfig = {
    output: 'export',
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'r2.creeper5820.com',
                pathname: '/**',
            },
        ],
    },
}

export default nextConfig
