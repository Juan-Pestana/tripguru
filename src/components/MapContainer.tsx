import { memo } from "react";
import dynamic from "next/dynamic";
import type { POI } from "@/types/types";

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
}

const MapContainer = memo(function MapContainer({
  route,
  stations,
  showRightSideOnly,
  selectedStation
}: MapContainerProps) {
  return (
    <div className="w-full md:w-2/3 h-64 md:h-full">
      <MapComponent
        route={route}
        stations={stations}
        showRightSideOnly={showRightSideOnly}
        selectedStation={selectedStation}
      />
    </div>
  );
});

export default MapContainer;
