"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") return null;

  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={() => router.back()}
      className="flex h-9 w-9 shrink-0 items-center justify-center text-primary"
    >
      <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
    </button>
  );
}
