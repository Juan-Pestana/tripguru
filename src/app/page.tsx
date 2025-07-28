"use client";

import { LocationInput } from "@/components/LocationInputs";
import { POITypeSelector } from "@/components/POITypeSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reverseGeocode } from "@/lib/utils";
import { Coordinates, POIType } from "@/types/types";
import { Fuel, MapPin, Navigation, Route } from "lucide-react";
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
    <div className="min-h-screen flex">
      {/* Desktop Split Screen - Left Side Background */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/386025/pexels-photo-386025.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop)"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-slate-900/80" />
          <div className="absolute inset-0 flex flex-col justify-center items-start p-12 xl:ml-24">
            <div className="text-white max-w-md">
              <div className="flex items-center mb-6">
                <Route className="w-10 h-10 mr-3 text-blue-300" />
                <h1 className="text-3xl font-bold">TripGuru</h1>
              </div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Encuentra la parada perfecta
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Descubre estaciones de servicio y puntos de recarga en tu
                camino. Planifica tu viaje con confianza.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center text-blue-100">
                  <Fuel className="w-5 h-5 mr-3 text-blue-300" />
                  <span>Estaciones de servicio</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <MapPin className="w-5 h-5 mr-3 text-blue-300" />
                  <span>Puntos de recarga</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Form / Mobile Full Screen */}
      <div className="w-full lg:w-1/2 relative">
        {/* Mobile Background */}
        <div
          className="lg:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/386025/pexels-photo-386025.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop)"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/90 via-blue-800/85 to-slate-900/90" />
        </div>

        {/* Desktop Background */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50" />

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col justify-center p-6 lg:p-12">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <Route className="w-8 h-8 mr-2 text-blue-300" />
              <h1 className="text-2xl font-bold">TripGuru</h1>
            </div>
            <h2 className="text-3xl font-bold mb-2">Encuentra tu ruta</h2>
            <p className="text-blue-100">Planifica tu viaje perfecto</p>
          </div>

          <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/95 lg:bg-white shadow-2xl border-0 lg:border">
            <CardHeader>
              <CardTitle className="text-lg">
                Ruta y estaciones de servicio
              </CardTitle>
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
                Buscar estaciones en ruta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// <Card className="w-full p-4 overflow-auto h-full">
// <CardHeader>
//   <CardTitle className="text-lg">
//     Ruta y estaciones de servicio
//   </CardTitle>
// </CardHeader>
// <CardContent className="space-y-6">
//   <LocationInput
//     origin={stateorigin}
//     destination={statedestination}
//     currentLocation={stateCurrentLocation}
//     isLoadingLocation={isLoadingLocation}
//     onOriginChange={setOrigin}
//     onDestinationChange={setDestination}
//     onGetCurrentLocation={handleGetCurrentLocation}
//   />

//   <POITypeSelector
//     selectedTypes={stateselectedPOITypes}
//     onTypeChange={setSelectedPOITypes}
//     fuelType={statefuelType}
//     connectionType={stateconnectionType}
//     onFuelTypeChange={setFuelType}
//     onConnectionTypeChange={setConnectionType}
//   />

//   <Button
//     onClick={handleSearch}
//     className="w-full"
//     disabled={
//       (!stateorigin && !stateCurrentLocation) || !statedestination
//     }
//   >
//     <Navigation className="mr-2" size={18} />
//     Buscar estaciones en ruta
//   </Button>
// </CardContent>
//   </Card>
