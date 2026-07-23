export default function cloudflareLoader({ src, width, quality }) {
  const outputQuality = quality || 75;
  const params = [`width=${width}`, `quality=${outputQuality}`];

  if (process.env.NODE_ENV === "development") {
    return `${src}?${params.join("&")}`;
  }

  const normalizedSrc = (src.startsWith("/") ? src.slice(1) : src).replace(/^media\//, "");
  return `/optimized-image/${width}/${outputQuality}/${normalizedSrc}`;
}
