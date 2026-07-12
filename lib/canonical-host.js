export function canonicalUrlFor(url) {
  if (url.hostname !== "finalnotes.page") return null;

  const canonicalUrl = new URL(url);
  canonicalUrl.hostname = "www.finalnotes.page";
  return canonicalUrl;
}
