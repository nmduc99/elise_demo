import createNextIntlPlugin from "next-intl/plugin";
import type { RemotePattern } from "next/dist/shared/lib/image-config";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
    output: 'standalone',
    experimental: {
        optimizeCss: false,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "picsum.photos",
                pathname: "/**",
            } as RemotePattern,

            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            } as RemotePattern,

            {
                protocol: "http",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            } as RemotePattern,

            {
                protocol: "https",
                hostname: "bmguploadimage-production.up.railway.app",
                pathname: "/**",
            } as RemotePattern,

            {
                protocol: "https",
                hostname: "mia.vn",
                pathname: "/**",
            } as RemotePattern,

            {
                protocol: "https",
                hostname: "**.unsplash.com",
                pathname: "/**",
            } as RemotePattern,
        ],

    },
};

export default withNextIntl(nextConfig);
// Restart dev server
