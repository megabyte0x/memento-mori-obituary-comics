"use client";

import { useState } from "react";

import { trackActivity } from "@/components/mixpanel-analytics";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SUPPORT_ZEC_ADDRESS } from "@/lib/site";

export function PdfSupportGate({ href, comic, surface = "pdf_button", variant = "miniGhost", className, label = "PDF" }) {
  const [open, setOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  function handleOpenChange(open) {
    setOpen(open);
    setCopyStatus("");
    if (open) {
      trackActivity("support_dialog_opened", {
        trigger_surface: surface,
        comic_slug: comic?.slug || "",
        support_context: "pdf_download",
      });
    }
  }

  function openSupportGate() {
    handleOpenChange(true);
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(SUPPORT_ZEC_ADDRESS);
      setCopyStatus("ZEC address copied.");
      trackActivity("support_zec_copied", { trigger_surface: surface, copy_result: "clipboard", comic_slug: comic?.slug || "" });
    } catch (_error) {
      setCopyStatus(SUPPORT_ZEC_ADDRESS);
      trackActivity("support_zec_copied", { trigger_surface: surface, copy_result: "fallback_text", comic_slug: comic?.slug || "" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button type="button" variant={variant} className={className} aria-haspopup="dialog" aria-expanded={open} onClick={openSupportGate}>
        {label}
      </Button>
      <DialogContent>
        <DialogClose className="support-close" aria-label="Close support modal">
          x
        </DialogClose>
        <div className="kicker">Support development</div>
        <DialogTitle>Support development</DialogTitle>
        <img className="support-qr-image" src="/assets/zec-qr.png" alt="ZEC donation QR code" />
        <DialogDescription>
          PDF access is free, but donations help keep new obituary comics, source checks, and reader tooling moving. Send ZEC to this shielded address:
        </DialogDescription>
        <code className="support-address" id="supportZecAddress">
          {SUPPORT_ZEC_ADDRESS}
        </code>
        <div className="support-actions">
          <Button variant="miniPrimary" type="button" onClick={copyAddress}>
            Copy ZEC address
          </Button>
          <DialogClose asChild>
            <a className="ui-button mini-btn ghost support-skip-link" href={href}>
              Skip for now
            </a>
          </DialogClose>
        </div>
        <p className="support-copy-status" aria-live="polite">
          {copyStatus}
        </p>
      </DialogContent>
    </Dialog>
  );
}
