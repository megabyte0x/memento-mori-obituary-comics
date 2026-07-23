export function canonicalUrlFor(url) {
  const isApex = url.hostname === "finalnotes.page";
  const isCanonicalHost = url.hostname === "www.finalnotes.page";
  if (!isApex && !isCanonicalHost) return null;
  if (isCanonicalHost && url.protocol === "https:") return null;

  const canonicalUrl = new URL(url);
  canonicalUrl.protocol = "https:";
  canonicalUrl.hostname = "www.finalnotes.page";
  canonicalUrl.port = "";
  return canonicalUrl;
}
