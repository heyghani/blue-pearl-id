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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(r2Pattern ? [r2Pattern] : []),
    ],
  },
};

export default nextConfig;
