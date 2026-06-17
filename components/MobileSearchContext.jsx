"use client";

import { createContext, useContext, useState } from "react";

const MobileSearchContext = createContext(null);

export function MobileSearchProvider({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <MobileSearchContext.Provider value={{ open, setOpen }}>
      {children}
    </MobileSearchContext.Provider>
  );
}

export function useMobileSearch() {
  return useContext(MobileSearchContext);
}
