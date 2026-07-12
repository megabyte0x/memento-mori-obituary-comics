/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    loader: "custom",
    loaderFile: "./image-loader.js",
    unoptimized: process.env.CLOUDFLARE_IMAGE_TRANSFORMATIONS !== "1",
    deviceSizes: [384, 640, 768, 1080, 1440, 1920],
    imageSizes: [128, 256, 384],
    localPatterns: [
      {
        pathname: "/media/comics/**/*.jpg",
        search: "",
      },
      {
        pathname: "/media/comics/**/*.jpeg",
        search: "",
      },
      {
        pathname: "/media/comics/**/*.png",
        search: "",
      },
    ],
    qualities: [75],
    contentDispositionType: "inline",
  },
  outputFileTracingIncludes: {
    "/api/latest-pdf": ["./comics.json"],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();
