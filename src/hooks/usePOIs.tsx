import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { POI } from "@/types/types";
//import { fetchPOIs } from "./useFetchPOIs"; // Move your fetchPOIs function to a separate file if needed
import { isStationOnRightSide } from "@/lib/utils";

interface FetchPOIsOptions {
  selectedTypes: Set<string>;
  fuelType: string;
  connectionType: string;
  radius?: number;
}
// Function to fetch POIs based on route coordinates and options
// This function can be moved to a separate file if needed
export async function fetchPOIs(
  routeCoordinates: [number, number][],
  options: FetchPOIsOptions
): Promise<POI[]> {
  const { selectedTypes, fuelType, connectionType, radius = 200 } = options;
  console.log(selectedTypes);
  const body = {
    routeCoordinates,
    fuel_type: selectedTypes.has("service_station") ? fuelType : undefined,
    connection_type: selectedTypes.has("ev_charging_point")
      ? connectionType
      : undefined,
    radius
  };

  const res = await fetch("/api/pois", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error("Failed to fetch POIs");
  }

  return res.json();
}

export function usePOIs(
  routeCoordinates: [number, number][] | undefined,
  options: FetchPOIsOptions | undefined,
  enabled: boolean = true
) {
  const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
  const [showRightSideOnly, setShowRightSideOnly] = useState(true);

  // Fetch POIs using TanStack Query
  const {
    data: pois = [],
    error,
    isLoading,
    refetch
  } = useQuery<POI[], Error>({
    queryKey: ["pois", routeCoordinates, options],
    queryFn: () => {
      if (!routeCoordinates || !options) throw new Error("Missing params");
      return fetchPOIs(routeCoordinates, options);
    },
    enabled: !!routeCoordinates && !!options && enabled,
    staleTime: 1000 * 60 * 5
  });

  // Add side info to POIs
  const processedPois = useMemo(
    () =>
      pois.map((poi) => ({
        ...poi,
        side: isStationOnRightSide(routeCoordinates ?? [], poi.coordinates)
          ? "right"
          : "left"
      })),
    [pois, routeCoordinates]
  );

  // Filter POIs based on side
  const filteredPois = useMemo(
    () =>
      showRightSideOnly
        ? processedPois.filter((poi) => poi.side === "right")
        : processedPois,
    [processedPois, showRightSideOnly]
  );

  const updateFilter = (showRightOnly: boolean) => {
    setShowRightSideOnly(showRightOnly);
  };

  return {
    pois: processedPois,
    filteredPois,
    selectedPOI,
    showRightSideOnly,
    error,
    isLoading,
    setShowRightSideOnly: updateFilter,
    setSelectedPOI,
    refetch
  };
}
