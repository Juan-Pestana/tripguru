import { memo } from "react";
import dynamic from "next/dynamic";
import type { POI } from "@/types/types";
import { set } from "zod";
import { is } from "drizzle-orm";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      Loading map...
    </div>
  )
});

interface MapContainerProps {
  route?: [number, number][];
  stations: POI[];
  showRightSideOnly: boolean;
  selectedStation: string | null;
  setSelectedPOI: (poiId: string | null) => void;
  isVisible: boolean;
}

const MapContainer = memo(function MapContainer({
  route,
  stations,
  showRightSideOnly,
  selectedStation,
  setSelectedPOI,
  isVisible
}: MapContainerProps) {
  return (
    <MapComponent
      route={route}
      isVisible={isVisible}
      stations={stations}
      showRightSideOnly={showRightSideOnly}
      selectedStation={selectedStation}
      setSelectedPOI={setSelectedPOI}
    />
  );
});

export default MapContainer;
