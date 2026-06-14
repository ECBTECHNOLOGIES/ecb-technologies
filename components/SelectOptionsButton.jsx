"use client";

import { useState } from "react";
import QuickSelectModal from "./QuickSelectModal";

export default function SelectOptionsButton({ product, className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center justify-center rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 ${className}`}
      >
        Select Options
      </button>
      {open && <QuickSelectModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
