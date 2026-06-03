"use client";

import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";

import { trackActivity } from "@/components/mixpanel-analytics";
import { Button } from "@/components/ui/button";

const RESET_DELAY_MS = 2200;

export function ComicShareButton({
  comic,
  className,
  surface,
  text = "Share",
  titlePrefix = "",
  variant = "miniGhost",
}) {
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (status !== "copied") return undefined;
    const timeout = window.setTimeout(() => setStatus("idle"), RESET_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [status]);

  async function handleClick() {
    const title = titlePrefix ? `${titlePrefix}: ${comic.person}` : `${comic.person} obituary comic`;
    const shareData = {
      title,
      text: comic.dek || title,
      url: `${window.location.origin}/comics/${comic.slug}/`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        trackActivity("comic_share_clicked", {
          comic_slug: comic.slug,
          share_surface: surface,
          share_method: "native",
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        setStatus("copied");
        trackActivity("comic_share_clicked", {
          comic_slug: comic.slug,
          share_surface: surface,
          share_method: "clipboard",
        });
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.warn("Comic share failed", error);
    }
  }

  return (
    <Button type="button" variant={variant} className={className} onClick={handleClick}>
      <Share2 size={14} aria-hidden="true" />
      {status === "copied" ? "Link copied" : text}
    </Button>
  );
}
