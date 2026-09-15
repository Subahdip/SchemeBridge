"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import type { PartnerMapProps } from "@/components/partner-map";

// Dynamic import with ssr: false to prevent Leaflet "window is not defined" SSR errors
const PartnerMap = dynamic(
  () => import("@/components/partner-map").then((mod) => mod.PartnerMap),
  {
    ssr: false,
    loading: () => (
      <div className="my-12 p-12 rounded-2xl border bg-card/60 backdrop-blur shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[400px]">
        <div className="h-10 w-10 border-4 border-teal-500/30 border-t-teal-600 rounded-full animate-spin" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 justify-center">
            <MapPin className="h-4 w-4 text-teal-600 animate-bounce" />
            Loading Channel Partner Geo-Spatial Network...
          </p>
          <p className="text-xs text-muted-foreground">
            Initializing India map (Lat: 20.5937, Lng: 78.9629) &amp; partner coordinates
          </p>
        </div>
      </div>
    ),
  }
);

export function PartnerMapContainer({ selectedScheme, onSchemeFilterChange }: PartnerMapProps) {
  return <PartnerMap selectedScheme={selectedScheme} onSchemeFilterChange={onSchemeFilterChange} />;
}
