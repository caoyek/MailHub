/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/MailHub",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
