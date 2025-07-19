"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";
import { LocationInput } from "@/components/LocationInputs";
import { POITypeSelector } from "@/components/POITypeSelector";
import { Spinner } from "@/components/ui/spinner";
import { POIList } from "@/components/POIList";
import { RouteInfo } from "@/components/RouteInfo";
import { useRoute } from "@/hooks/useRoute";
import { usePOIs } from "@/hooks/usePOIs";
import { type Coordinates, type POIType, RouteData } from "@/types/types";
import { reverseGeocode } from "@/lib/utils";
import MapContainer from "@/components/MapContainer";

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

  // const [stateorigin, setOrigin] = useState(origin);
  // const [statedestination, setDestination] = useState(destination);
  // const [stateCurrentLocation, setCurrentLocation] =
  //   useState<Coordinates | null>(currentLocation);
  // const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  // const [error, setError] = useState<string | null>(null);

  // // POI selection state
  // const [stateselectedPOITypes, setSelectedPOITypes] = useState<Set<POIType>>(
  //   selectedPOITypes || new Set(["service_station"])
  // );
  // const [statefuelType, setFuelType] = useState(fuelType || "gasoleo_a");
  // const [stateconnectionType, setConnectionType] = useState(
  //   connectionType || "CCS (Type 2)"
  // );
  //const [isLoading, setIsLoading] = useState(false);

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
    refetch
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

  // // Location handling
  // const handleGetCurrentLocation = async () => {
  //   setIsLoadingLocation(true);
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const { latitude, longitude } = position.coords;
  //         setCurrentLocation({ lat: latitude, lng: longitude });

  //         // Convert coordinates to address using reverse geocoding
  //         reverseGeocode(latitude, longitude)
  //           .then((address) => {
  //             //setOrigin(address);
  //             setIsLoadingLocation(false);
  //           })
  //           .catch((err) => {
  //             console.error("Reverse geocoding error:", err);
  //             setOrigin(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
  //             setIsLoadingLocation(false);
  //           });
  //       },
  //       (error) => {
  //         console.error("Geolocation error:", error);
  //         setError(
  //           "Could not get your current location. Please allow location access."
  //         );
  //         setIsLoadingLocation(false);
  //       }
  //     );
  //   } else {
  //     setError("Geolocation is not supported by your browser.");
  //     setIsLoadingLocation(false);
  //   }
  // };

  // // Search handling
  // const handleSearch = () => {
  //   if ((!stateorigin && !stateCurrentLocation) || !statedestination) return;

  //   const params = new URLSearchParams();
  //   params.set("origin", stateorigin);
  //   params.set("destination", statedestination);
  //   if (stateCurrentLocation) {
  //     params.set("lat", stateCurrentLocation.lat.toString());
  //     params.set("lng", stateCurrentLocation.lng.toString());
  //   }
  //   params.set("fuelType", statefuelType);
  //   params.set("connectionType", stateconnectionType);
  //   params.set("selectedTypes", Array.from(stateselectedPOITypes).join(","));

  //   router.push(`/results?${params.toString()}`);
  //   console.log("Search params updated:", params.toString());
  // };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Card className="w-full md:w-1/3 p-4 overflow-auto h-full">
        {/* <CardHeader>
          <CardTitle>Route & Service Stations</CardTitle>
        </CardHeader> */}
        <CardContent className="space-y-6">
          {/* <LocationInput
            origin={stateorigin}
            destination={statedestination}
            currentLocation={stateCurrentLocation}
            isLoadingLocation={isLoadingLocation}
            onOriginChange={setOrigin}
            onDestinationChange={setDestination}
            onGetCurrentLocation={handleGetCurrentLocation}
          />

          <POITypeSelector
            selectedTypes={stateselectedPOITypes}
            onTypeChange={setSelectedPOITypes}
            fuelType={statefuelType}
            connectionType={stateconnectionType}
            onFuelTypeChange={setFuelType}
            onConnectionTypeChange={setConnectionType}
          />

          <Button
            onClick={handleSearch}
            className="w-full"
            disabled={
              (!stateorigin && !stateCurrentLocation) || !statedestination
            }
          >
            <Navigation className="mr-2" size={18} />
            Find Route and Stations
          </Button> */}

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
      </Card>

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
        showRightSideOnly={showRightSideOnly}
        selectedStation={selectedPOI}
      />
    </div>
  );
}
