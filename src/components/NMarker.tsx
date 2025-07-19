"use client";

import dynamic from "next/dynamic";
import type L from "leaflet";
import { type Ref, useEffect, useState } from "react";
import type { POI } from "@/types/types";

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false
});

import { forwardRef } from "react";

export const NMarker = forwardRef<
  L.Marker,
  {
    station: POI;
    icon: L.Icon;
    children: React.ReactNode;
  }
>(({ station, icon, children }, ref: Ref<L.Marker>) => {
  return (
    <Marker
      key={station.id}
      position={[station.coordinates[0], station.coordinates[1]]}
      icon={icon}
      ref={ref}
    >
      <Popup className="w-96">
        {/* <ServiceStationPopup station={sampleStation} /> */}
        {children}
      </Popup>
    </Marker>
  );
});

NMarker.displayName = "NMarker";
