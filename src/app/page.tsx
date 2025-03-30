"use client";

// pages/index.tsx
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import polyline from "@mapbox/polyline";
import { getRoute } from "@/actions/getRoute";
import { getPOIsFromDatabase, type POI } from "@/actions/getPOIs";
import {
	calculateDistance,
	isStationOnRightSide,
	reverseGeocode,
} from "@/lib/utils";
import { ServiceStationCard } from "@/components/service-station-card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectGroup,
	SelectLabel,
} from "@/components/ui/select";

// Types for our application
interface Coordinates {
	lat: number;
	lng: number;
}

interface RouteData {
	coordinates: [number, number][];
	distance: number;
	duration: number;
}

// Dynamically import the Map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("../components/MapComponent"), {
	ssr: false,
	loading: () => (
		<div className="h-full w-full bg-gray-100 flex items-center justify-center">
			Loading map...
		</div>
	),
});

export default function Home() {
	// State variables
	const [origin, setOrigin] = useState<string>("");
	const [destination, setDestination] = useState<string>("");
	const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
		null,
	);
	const [fuelType, setFuelType] = useState<string>("gasoleo_a");
	const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
	const [route, setRoute] = useState<RouteData | null>(null);
	const [serviceStations, setServiceStations] = useState<POI[]>([]);
	const [filteredStations, setFilteredStations] = useState<POI[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [showRightSideOnly, setShowRightSideOnly] = useState<boolean>(true);
	const [selectedStation, setSelectedStation] = useState<string | null>(null);

	// Function to get current location
	const getCurrentLocation = () => {
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

	// Function to fetch route and service stations
	const fetchRouteAndStations = async () => {
		try {
			// Reset previous state
			setRoute(null);
			//setServiceStations([]);
			setFilteredStations([]);
			setError(null);

			const routeData = await getRoute({
				origin,
				destination,
				currentLocation,
			});

			const encodedGeometry = routeData.routes[0].geometry;
			let decodedCoordinates: [number, number][];

			// Decode the geometry to get the coordinates
			if (typeof encodedGeometry === "object") {
				// Extract coordinates from GeoJSON
				decodedCoordinates = routeData.routes[0].geometry.coordinates.map(
					(coord: [number, number]) => [coord[1], coord[0]], // Convert from [lon, lat] to [lat, lon]
				);

				setRoute({
					coordinates: decodedCoordinates,
					distance: routeData.routes[0].summary.distance / 1000, // Convert to km
					duration: routeData.routes[0].summary.duration / 60, // Convert to minutes
				});
			}
			// If we have a polyline encoded string
			else if (typeof encodedGeometry === "string") {
				// Decode the polyline - default precision is 5, but ORS might use 6
				decodedCoordinates = polyline.decode(encodedGeometry);
				//console.log("this is decoded coordinates", decodedCoordinates);

				setRoute({
					coordinates: decodedCoordinates,
					distance: routeData.routes[0].summary.distance / 1000,
					duration: routeData.routes[0].summary.duration / 60,
				});
			} else {
				throw new Error("Unexpected geometry format in response");
			}

			async function findPOIsAlongPolyline() {
				try {
					const pois = await getPOIsFromDatabase(
						decodedCoordinates,
						fuelType,
						200, // radius in meters
					);

					const processedStations = pois.map((station: POI) => {
						const isRight = isStationOnRightSide(
							//route?.coordinates as [number, number][],
							decodedCoordinates as [number, number][],
							station.coordinates,
						);
						return {
							...station,
							side: isRight
								? "right"
								: ("left" as "left" | "right" | "unknown"),
						};
					});

					setServiceStations(processedStations);
				} catch (error) {
					console.error("Error fetching POIs along polyline:", error);
					setError("Failed to fetch service stations. Please try again.");
				}
			}

			findPOIsAlongPolyline();
		} catch (err) {
			console.error("Error fetching route and stations:", err);
			setError("Failed to fetch route and service stations. Please try again.");
		}
	};

	// Update filtered stations when filter preference changes
	useEffect(() => {
		if (serviceStations.length > 0) {
			if (showRightSideOnly) {
				setFilteredStations(
					serviceStations.filter((station) => station.side === "right"),
				);
			} else {
				setFilteredStations(serviceStations);
			}
		}
	}, [showRightSideOnly, serviceStations]);

	const onStationClick = (stationId: string) => {
		setSelectedStation(stationId);
	};

	return (
		<div className="flex flex-col md:flex-row h-screen">
			{/* Input Section */}
			<Card className="w-full md:w-1/3 p-4 overflow-auto h-screen">
				<CardHeader>
					<CardTitle>Route & Service Stations</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex space-x-2">
							<Input
								placeholder="Enter Origin"
								value={origin}
								onChange={(e) => setOrigin(e.target.value)}
								className="flex-grow"
								disabled={isLoadingLocation || currentLocation !== null}
							/>
							<Button
								onClick={getCurrentLocation}
								disabled={isLoadingLocation || currentLocation !== null}
								variant={currentLocation ? "default" : "outline"}
								className="flex-shrink-0"
							>
								{isLoadingLocation ? "Getting..." : <MapPin size={18} />}
							</Button>
						</div>
						<div className="flex space-x-2">
							<Input
								placeholder="Enter Destination"
								value={destination}
								onChange={(e) => setDestination(e.target.value)}
							/>
							<Select onValueChange={(value) => setFuelType(value)}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Select fuel" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Fuels</SelectLabel>
										<SelectItem value="gasoleo_a">Diesel</SelectItem>
										<SelectItem value="gasoleo_premium">Diesel Prem</SelectItem>
										<SelectItem value="gasolina_95_e5">Gasolina 95</SelectItem>
										<SelectItem value="gasolina_95_e5_premium">
											Gasolina 98
										</SelectItem>
										<SelectItem value="glp">GLP</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="rightSideOnly"
								checked={showRightSideOnly}
								onChange={(e) => setShowRightSideOnly(e.target.checked)}
								className="h-4 w-4"
							/>
							<label htmlFor="rightSideOnly" className="text-sm font-medium">
								Show only stations on the right side of the road
							</label>
						</div>

						<Button
							onClick={fetchRouteAndStations}
							className="w-full"
							disabled={(!origin && !currentLocation) || !destination}
						>
							<Navigation className="mr-2" size={18} />
							Find Route and Stations
						</Button>

						{/* Service Stations List */}
						{filteredStations.length > 0 && (
							<div className="mt-4">
								<h3 className="font-bold mb-2">
									{showRightSideOnly
										? "Service Stations (Right Side Only)"
										: "All Service Stations"}
								</h3>
								<div className="h-full overflow-y-auto">
									{filteredStations.map((station) => (
										<ServiceStationCard
											key={station.id}
											station={station}
											onClick={() => onStationClick(station.id)}
										/>
									))}
								</div>
							</div>
						)}

						{/* Route Information */}
						{route && (
							<div className="mt-4 p-3 bg-gray-50 rounded-md">
								<h3 className="font-bold mb-1">Route Information</h3>
								<p className="text-sm">
									Distance: {route.distance.toFixed(1)} km
								</p>
								<p className="text-sm">
									Duration: {route.duration.toFixed(0)} min
								</p>
							</div>
						)}

						{/* Error Handling */}
						{error && (
							<div className="text-red-500 mt-4 p-3 bg-red-50 rounded-md">
								{error}
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Map Section */}
			<div className="w-full md:w-2/3 h-64 md:h-full">
				<MapComponent
					route={route?.coordinates}
					stations={filteredStations}
					showRightSideOnly={showRightSideOnly}
					selectedStation={selectedStation}
				/>
			</div>
		</div>
	);
}
