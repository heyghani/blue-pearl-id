import type { NextConfig } from "next";

function getR2RemotePattern() {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) return null;

  try {
    const { protocol, hostname } = new URL(publicUrl);
    if (hostname) {
      return {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
      };
    }
  } catch {
    return null;
  }

  return null;
}

const r2Pattern = getR2RemotePattern();

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/google854c868d465b316a.html",
        destination: "/google-site-verification",
      },
    ];
  },
  images: {
    // Serve images directly (Blob, R2, /uploads) — avoids Vercel Image Optimization quota/billing limits.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
      ...(r2Pattern ? [r2Pattern] : []),
    ],
  },
};

export default nextConfig;
