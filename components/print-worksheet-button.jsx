"use client";

import { Button } from "@/components/ui/button";

export function PrintWorksheetButton() {
  return (
    <Button type="button" variant="primary" onClick={() => window.print()}>
      Print worksheet
    </Button>
  );
}
