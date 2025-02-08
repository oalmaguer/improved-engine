/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {

        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'replicate.delivery',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'dbawyooajyzbrzmpfofq.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
                pathname: '/**',
            },
        ],
    },
}


module.exports = nextConfig
