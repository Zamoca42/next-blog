// @ts-check
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants.js";
import { savePostMetadata, shouldUpdateGitInfo } from "./src/script/post-index.js";
import { updateAlgoliaIndex } from "./src/script/algolia-index.js";
import { generateRssFeed } from "./src/script/generate-rss.js";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * @typedef {import('next').NextConfig} NextConfig
 */

/**
 * @param {string} phase
 * @returns {Promise<NextConfig>}
 */
export default async (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
      await savePostMetadata();
      await generateRssFeed();
  }

  if (phase === PHASE_PRODUCTION_BUILD && process.env.VERCEL_ENV === "production") {
    await updateAlgoliaIndex();
  }

  /** @type {NextConfig} */
  const nextConfig = {
    images: {
      imageSizes: [32, 48, 64, 96],
      deviceSizes: [750, 828, 1080, 1200],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'github.com',
        },
        {
          protocol: 'https',
          hostname: "user-images.githubusercontent.com",
        },
        {
          protocol: 'https',
          hostname: "capsule-render.vercel.app",
        },
        {
          protocol: 'https',
          hostname: "img.shields.io",
        },
        {
          protocol: 'https',
          hostname: "github-readme-stats.vercel.app",
        },
      ],
    },
  };

  return withBundleAnalyzer(nextConfig);
};