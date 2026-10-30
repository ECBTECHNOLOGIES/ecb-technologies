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
        className={`btn-secondary btn-sm [.on-dark_&]:text-primary-on-dark [.on-dark_&]:shadow-[inset_0_0_0_1px_#2997ff] ${className}`}
      >
        Choose options
      </button>
      {open && <QuickSelectModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
