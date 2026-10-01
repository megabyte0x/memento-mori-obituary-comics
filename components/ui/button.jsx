import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/components/ui/utils";

const variants = {
  default: "btn",
  primary: "btn primary",
  mini: "mini-btn",
  miniPrimary: "mini-btn primary",
  miniGhost: "mini-btn ghost",
  reader: "reader-btn",
  readerPrimary: "reader-btn primary",
  nav: "nav-support",
};

export const Button = React.forwardRef(function Button({ asChild = false, className, variant = "default", ...props }, ref) {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn("ui-button", variants[variant], className)} {...props} />;
});
