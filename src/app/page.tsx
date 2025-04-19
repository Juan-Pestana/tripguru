"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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
	),
});

export default function Home() {
	// Core state
	const [origin, setOrigin] = useState("");
	const [destination, setDestination] = useState("");
	const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
		null,
	);
	const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// POI selection state
	const [selectedPOITypes, setSelectedPOITypes] = useState<Set<POIType>>(
		new Set(["service_station"]),
	);
	const [fuelType, setFuelType] = useState("gasoleo_a");
	const [connectionType, setConnectionType] = useState("CCS (Type 2)");
	const [isLoading, setIsLoading] = useState(false);

	// Route and POIs state managed by custom hooks
	const { route, fetchRoute, error: routeError } = useRoute();
	const {
		filteredPois,
		selectedPOI,
		showRightSideOnly,
		error: poisError,
		setShowRightSideOnly,
		setSelectedPOI,
		fetchPOIs,
	} = usePOIs();

	// Location handling
	const handleGetCurrentLocation = async () => {
		setIsLoadingLocation(true);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					setCurrentLocation({ lat: latitude, lng: longitude });

					// Convert coordinates to address using reverse geocoding
					reverseGeocode(latitude, longitude)
						.then((address) => {
							//setOrigin(address);
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
						"Could not get your current location. Please allow location access.",
					);
					setIsLoadingLocation(false);
				},
			);
		} else {
			setError("Geolocation is not supported by your browser.");
			setIsLoadingLocation(false);
		}
	};

	// Search handling
	const handleSearch = async () => {
		if ((!origin && !currentLocation) || !destination) return;

		setIsLoading(true);

		const routeResult = await fetchRoute({
			origin,
			destination,
			currentLocation,
		});

		if (routeResult) {
			await fetchPOIs(routeResult.coordinates, {
				fuelType,
				connectionType,
				selectedTypes: selectedPOITypes,
			});
		}
		setIsLoading(false);
	};

	return (
		<div className="flex flex-col md:flex-row h-screen">
			<Card className="w-full md:w-1/3 p-4 overflow-auto h-screen">
				<CardHeader>
					<CardTitle>Route & Service Stations</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<LocationInput
						origin={origin}
						destination={destination}
						currentLocation={currentLocation}
						isLoadingLocation={isLoadingLocation}
						onOriginChange={setOrigin}
						onDestinationChange={setDestination}
						onGetCurrentLocation={handleGetCurrentLocation}
					/>

					<POITypeSelector
						selectedTypes={selectedPOITypes}
						onTypeChange={setSelectedPOITypes}
						fuelType={fuelType}
						connectionType={connectionType}
						onFuelTypeChange={setFuelType}
						onConnectionTypeChange={setConnectionType}
					/>

					<Button
						onClick={handleSearch}
						className="w-full"
						disabled={(!origin && !currentLocation) || !destination}
					>
						<Navigation className="mr-2" size={18} />
						Find Route and Stations
					</Button>

					{isLoading && <Spinner />}
					{(routeError || poisError) && (
						<div className="text-red-500 p-3 bg-red-50 rounded-md">
							{routeError || poisError}
						</div>
					)}

					{route && (
						<RouteInfo route={route} isLoading={isLoading} error={error} />
					)}

					{filteredPois.length > 0 && (
						<POIList
							pois={filteredPois}
							showRightSideOnly={showRightSideOnly}
							onPOIClick={setSelectedPOI}
							onFilterChange={setShowRightSideOnly}
						/>
					)}
				</CardContent>
			</Card>

			<MapContainer
				route={route?.coordinates}
				stations={filteredPois}
				showRightSideOnly={showRightSideOnly}
				selectedStation={selectedPOI}
			/>
		</div>
	);
}
