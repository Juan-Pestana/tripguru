import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { POI } from "@/types/types";
//import { fetchPOIs } from "./useFetchPOIs"; // Move your fetchPOIs function to a separate file if needed
import { isStationOnRightSide } from "@/lib/utils";
import { getEVStationDetails, getStationDetails } from "@/actions/getPoyById";
import type { EVStationDetails, StationDetails } from "@/actions/getPoyById";

export type POIwDetails =
  | (Extract<POI, { type: "service_station" }> & { details: StationDetails })
  | (Extract<POI, { type: "ev_charging_point" }> & {
      details: EVStationDetails;
    });

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

  const selectedPOIObject = useMemo(
    () => processedPois.find((poi) => poi.id === selectedPOI) || null,
    [processedPois, selectedPOI]
  );

  // Query for POI details by locationId
  const {
    data: selectedPOIDetails,
    error: selectedPOIDetailsError,
    isLoading: isLoadingSelectedPOIDetails,
    refetch: refetchSelectedPOIDetails
  } = useQuery({
    queryKey: [
      "poi-details",
      selectedPOIObject?.location_id,
      selectedPOIObject?.type
    ],
    queryFn: async () => {
      if (!selectedPOIObject) return null;
      if (selectedPOIObject.type === "service_station") {
        const details = await getStationDetails(selectedPOIObject.location_id);
        return { ...selectedPOIObject, details: { ...details } } as POIwDetails;
      } else if (selectedPOIObject.type === "ev_charging_point") {
        const details = await getEVStationDetails(
          selectedPOIObject.location_id
        );
        return { ...selectedPOIObject, details: { ...details } } as POIwDetails;
      }
      return null;
    },
    enabled: !!selectedPOIObject?.location_id,
    staleTime: 1000 * 60 * 5
  });

  return {
    pois: processedPois,
    filteredPois,
    selectedPOI,
    showRightSideOnly,
    error,
    isLoading,
    setShowRightSideOnly: updateFilter,
    setSelectedPOI,
    refetch,
    selectedPOIDetails,
    selectedPOIDetailsError,
    isLoadingSelectedPOIDetails,
    refetchSelectedPOIDetails
  };
}
