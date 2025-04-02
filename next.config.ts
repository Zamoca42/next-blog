// @ts-check
import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants.js";
import { savePostMetadata, shouldUpdateGitInfo } from "./src/script/post-index.js";
import { updateAlgoliaIndex } from "./src/script/algolia-index.js";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default async (phase: string): Promise<NextConfig> => {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    await savePostMetadata();
  }

  if (phase === PHASE_PRODUCTION_BUILD && process.env.VERCEL_ENV === "production") {
    await updateAlgoliaIndex();
  }

  const nextConfig: NextConfig = {
    images: {
      imageSizes: [32, 48, 64, 96],
      deviceSizes: [750, 828, 1080, 1200],
      dangerouslyAllowSVG: true,
      contentDispositionType: 'attachment',
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      unoptimized: true,
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'github.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'user-images.githubusercontent.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'capsule-render.vercel.app',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'img.shields.io',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'github-readme-stats.vercel.app',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'mermaid.ink',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'raw.githubusercontent.com',
          pathname: '/**',
        }
      ],
    },
  };

  return withBundleAnalyzer(nextConfig);
};