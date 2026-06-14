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
        className={`flex min-w-[100px] items-center justify-center rounded-md bg-brand-green px-4 py-[7px] text-xs font-semibold text-white transition-colors hover:bg-green-700 ${className}`}
      >
        Select Options
      </button>
      {open && <QuickSelectModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
