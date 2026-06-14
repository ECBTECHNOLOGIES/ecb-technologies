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
        className={`flex items-center justify-center whitespace-nowrap rounded-md bg-brand-green px-3 py-[7px] text-[11px] font-bold text-white transition-colors hover:bg-green-700 sm:min-w-[100px] ${className}`}
      >
        Select Options
      </button>
      {open && <QuickSelectModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
