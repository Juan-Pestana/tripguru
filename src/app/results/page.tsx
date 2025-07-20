"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { CardContent } from "@/components/ui/card";

import { Spinner } from "@/components/ui/spinner";
import { POIList } from "@/components/POIList";
import { RouteInfo } from "@/components/RouteInfo";
import { useRoute } from "@/hooks/useRoute";
import { usePOIs } from "@/hooks/usePOIs";
import { POIType } from "@/types/types";
import { reverseGeocode } from "@/lib/utils";
import MapContainer from "@/components/MapContainer";
import { Map, List } from "lucide-react";
import { DrawerDialogDemo } from "@/components/DrawerDialog";

// Dynamically import the Map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      Loading map...
    </div>
  )
});

export default function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();

  //url state
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const currentLocation =
    searchParams.get("lat") && searchParams.get("lng")
      ? {
          lat: Number(searchParams.get("lat")),
          lng: Number(searchParams.get("lng"))
        }
      : null;
  const fuelType = searchParams.get("fuelType") || "gasoleo_a";
  const connectionType = searchParams.get("connectionType") || "CCS (Type 2)";
  const selectedPOITypes = new Set<POIType>(
    (searchParams.get("selectedTypes") || "service_station").split(
      ","
    ) as POIType[]
  );

  // local state

  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const {
    route,
    isLoading: isLoadingRoute,
    error: routeError
  } = useRoute(
    origin && destination
      ? {
          origin,
          destination,
          currentLocation
        }
      : null
  );
  const {
    filteredPois,
    pois,
    selectedPOI,
    showRightSideOnly,
    error: poisError,
    isLoading: isLoadingPois,
    setShowRightSideOnly,
    setSelectedPOI,
    refetch,
    selectedPOIDetails,
    selectedPOIDetailsError,
    isLoadingSelectedPOIDetails,
    refetchSelectedPOIDetails
  } = usePOIs(
    route?.coordinates,
    {
      selectedTypes: selectedPOITypes,
      fuelType,
      connectionType,
      radius: 200 // or any value you want, or make it stateful
    },
    !!route // enabled only if route exists
  );

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* 3. Mobile top banner */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-white border-b sticky top-0 z-10">
        <button
          className="text-blue-600 font-medium flex items-center"
          onClick={() => router.push("/")}
        >
          {/* Back arrow (optional) */}
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="ml-1">Back to search</span>
        </button>
        <button
          className="p-2"
          onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
          aria-label="Toggle view"
        >
          {mobileView === "list" ? <Map size={24} /> : <List size={24} />}
        </button>
      </div>
      <div
        className={`
          w-full md:w-1/3 p-2 overflow-auto h-full
          ${mobileView === "map" ? "hidden" : ""}
          md:block
        `}
      >
        <CardContent className="space-y-6 p-2">
          {route && (
            <RouteInfo
              route={route}
              isLoading={isLoadingRoute}
              error={routeError?.message}
            />
          )}

          {routeError && (
            <div className="text-red-500 p-3 bg-red-50 rounded-md">
              {routeError.message}
            </div>
          )}
          {poisError && (
            <div className="text-red-500 p-3 bg-red-50 rounded-md">
              {poisError.message}
            </div>
          )}

          {(isLoadingPois || isLoadingRoute) && (
            <div className="flex items-center justify-center  h-screen">
              <Spinner
                message={
                  isLoadingRoute ? "Cargando Ruta" : "Cargando Estaciones"
                }
              />
            </div>
          )}

          {filteredPois.length > 0 && (
            <POIList
              pois={filteredPois.map((poi) => ({
                ...poi,
                side:
                  poi.side === "right" ||
                  poi.side === "left" ||
                  poi.side === "unknown"
                    ? poi.side
                    : "unknown"
              }))}
              showRightSideOnly={showRightSideOnly}
              onPOIClick={setSelectedPOI}
              onFilterChange={setShowRightSideOnly}
            />
          )}
        </CardContent>
      </div>

      <div
        className={`
          w-full h-full
          ${mobileView === "list" ? "hidden" : ""}
          md:block md:w-2/3
        `}
      >
        <MapContainer
          route={route?.coordinates}
          stations={filteredPois.map((poi) => ({
            ...poi,
            side:
              poi.side === "right"
                ? "right"
                : poi.side === "left"
                  ? "left"
                  : "unknown"
          }))}
          setSelectedPOI={setSelectedPOI}
          isVisible={mobileView === "map"}
          showRightSideOnly={showRightSideOnly}
          selectedStation={selectedPOI}
        />
      </div>
      <DrawerDialogDemo
        open={!!selectedPOI}
        onOpenChange={(open) => {
          if (!open) setSelectedPOI(null);
        }}
        station={selectedPOIDetails}
        isLoading={isLoadingSelectedPOIDetails}
        error={selectedPOIDetailsError}
      />
    </div>
  );
}
