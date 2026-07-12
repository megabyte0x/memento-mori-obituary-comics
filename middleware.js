import { NextResponse } from "next/server";

import { canonicalUrlFor } from "./lib/canonical-host.js";

export function middleware(request) {
  const canonicalUrl = canonicalUrlFor(request.nextUrl);
  return canonicalUrl ? NextResponse.redirect(canonicalUrl, 308) : NextResponse.next();
}
