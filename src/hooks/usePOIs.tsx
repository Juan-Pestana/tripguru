import { useState } from "react";
import type { POI } from "@/types/types";
import {
	getAllPOIs,
	getEVChargingPoints,
	getServiceStations,
} from "@/actions/getPois2";
import { isStationOnRightSide } from "@/lib/utils";

interface FetchPOIsOptions {
	selectedTypes: Set<string>;
	fuelType: string;
	connectionType: string;
	radius?: number;
}

export function usePOIs() {
	const [pois, setPois] = useState<POI[]>([]);
	const [filteredPois, setFilteredPois] = useState<POI[]>([]);
	const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
	const [showRightSideOnly, setShowRightSideOnly] = useState(true);

	const [error, setError] = useState<string | null>(null);

	const fetchPOIs = async (
		routeCoordinates: [number, number][],
		options: FetchPOIsOptions,
	) => {
		const { selectedTypes, fuelType, connectionType, radius = 200 } = options;

		try {
			setError(null);
			let fetchedPois: POI[] = [];

			if (selectedTypes.size === 2) {
				// Both types selected
				fetchedPois = await getAllPOIs(
					routeCoordinates,
					fuelType,
					connectionType,
					radius,
				);
			} else if (selectedTypes.has("service_station")) {
				// Only service stations
				fetchedPois = await getServiceStations(
					routeCoordinates,
					fuelType,
					radius,
				);
			} else if (selectedTypes.has("ev_charging_point")) {
				// Only EV charging points
				fetchedPois = await getEVChargingPoints(
					routeCoordinates,
					connectionType,
					radius,
				);
			}

			// Process POIs to determine their side of the road
			const processedPois = fetchedPois.map(
				(poi) =>
					({
						...poi,
						side: isStationOnRightSide(routeCoordinates, poi.coordinates)
							? "right"
							: "left",
					}) as POI,
			);

			setPois(processedPois);
			// Apply right-side filter if enabled
			setFilteredPois(
				showRightSideOnly
					? processedPois.filter((poi) => poi.side === "right")
					: processedPois,
			);
		} catch (err) {
			console.error("Error fetching POIs:", err);
			setError("Failed to fetch points of interest");
		}
	};

	// Update filtered POIs when filter changes
	const updateFilter = (showRightOnly: boolean) => {
		setShowRightSideOnly(showRightOnly);
		setFilteredPois(
			showRightOnly ? pois.filter((poi) => poi.side === "right") : pois,
		);
	};

	return {
		pois,
		filteredPois,
		selectedPOI,
		showRightSideOnly,

		error,
		setFilteredPois,
		setShowRightSideOnly: updateFilter,
		setSelectedPOI,
		fetchPOIs,
	};
}
