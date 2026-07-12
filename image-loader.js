export default function cloudflareLoader({ src, width, quality }) {
  const params = [`width=${width}`];
  if (quality) params.push(`quality=${quality}`);

  if (process.env.NODE_ENV === "development") {
    return `${src}?${params.join("&")}`;
  }

  const normalizedSrc = src.startsWith("/") ? src.slice(1) : src;
  return `/cdn-cgi/image/${params.join(",")}/${normalizedSrc}`;
}
