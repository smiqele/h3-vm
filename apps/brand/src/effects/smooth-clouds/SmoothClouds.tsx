"use client";

import { AsciiClouds } from "../ascii-clouds/AsciiClouds";

export function SmoothClouds({ terminal = false }: { terminal?: boolean }) {
  return <AsciiClouds hideAtPointer terminal={terminal} />;
}
