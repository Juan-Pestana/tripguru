"use client";

import { LocationInput } from "@/components/LocationInputs";
import { POITypeSelector } from "@/components/POITypeSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reverseGeocode } from "@/lib/utils";
import { Coordinates, POIType } from "@/types/types";
import { Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Search() {
  const router = useRouter();

  const [stateorigin, setOrigin] = useState("");
  const [statedestination, setDestination] = useState("");
  const [stateCurrentLocation, setCurrentLocation] =
    useState<Coordinates | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // POI selection state
  const [stateselectedPOITypes, setSelectedPOITypes] = useState<Set<POIType>>(
    new Set(["service_station"])
  );
  const [statefuelType, setFuelType] = useState("gasoleo_a");
  const [stateconnectionType, setConnectionType] = useState("CCS (Type 2)");

  // Location handling
  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Current position:", position);
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });

          // Convert coordinates to address using reverse geocoding
          reverseGeocode(latitude, longitude)
            .then((address) => {
              setOrigin(address);
              setIsLoadingLocation(false);
            })
            .catch((err) => {
              console.error("Reverse geocoding error:", err);
              setOrigin(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
              setIsLoadingLocation(false);
            });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError(
            "Could not get your current location. Please allow location access."
          );
          setIsLoadingLocation(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setIsLoadingLocation(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("origin", stateorigin);
    params.set("destination", statedestination);
    if (stateCurrentLocation) {
      params.set("lat", String(stateCurrentLocation.lat));
      params.set("lng", String(stateCurrentLocation.lng));
    }
    params.set("fuelType", statefuelType);
    params.set("connectionType", stateconnectionType);
    params.set("selectedTypes", Array.from(stateselectedPOITypes).join(","));

    router.push(`/results?${params.toString()}`);

    // Update the URL with the new search parameters}
  };

  return (
    <main className="flex items-center justify-center h-screen p-4">
      <div className="my-auto">
        <Card className="w-full p-4 overflow-auto h-full">
          <CardHeader>
            <CardTitle>Route & Service Stations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <LocationInput
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
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
