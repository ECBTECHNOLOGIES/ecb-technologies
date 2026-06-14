"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GoBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}
