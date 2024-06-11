// @ts-check
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require('next/constants');
const { saveGitInfo } = require("./src/script/log-script");

/**
 * @typedef {import('next').NextConfig} NextConfig
 */
/**
 * @param {string} phase
 * @returns {Promise<NextConfig>}
 */
module.exports = async (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    await saveGitInfo();
  }

  /** @type {NextConfig} */
  const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'github.com',
          port: '',
        },
        {
          protocol: 'https',
          hostname: "user-images.githubusercontent.com",
          port: '',
        },
      ],
    },
  };

  return nextConfig;
};