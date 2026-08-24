"use client";

import { createContext, useContext } from "react";

const CatalogBasePathContext = createContext("/products");

export function CatalogBasePathProvider({
  basePath,
  children,
}: {
  basePath: string;
  children: React.ReactNode;
}) {
  return (
    <CatalogBasePathContext.Provider value={basePath}>
      {children}
    </CatalogBasePathContext.Provider>
  );
}

export function useCatalogBasePath() {
  return useContext(CatalogBasePathContext);
}

export function catalogHref(basePath: string, qs: string) {
  return qs ? `${basePath}?${qs}` : basePath;
}
