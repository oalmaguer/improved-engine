/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        viewTransitions: true,
      },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'replicate.delivery',
                pathname: '/**',
            },
        ],
    },
}

module.exports = nextConfig
