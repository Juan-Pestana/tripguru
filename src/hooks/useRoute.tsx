"use client";

import { useState } from "react";
import { getRoute, type routeParams } from "@/actions/getRoute";
import type { RouteData } from "@/types/types";
import polyline from "@mapbox/polyline";

export function useRoute() {
	const [route, setRoute] = useState<RouteData | null>(null);
	const [error, setError] = useState<string | null>(null);

	const fetchRoute = async (params: routeParams) => {
		try {
			setError(null);
			const routeData = await getRoute(params);

			const encodedGeometry = routeData.routes[0].geometry;
			let decodedCoordinates: [number, number][];

			// Decode the geometry to get the coordinates
			if (typeof encodedGeometry === "object") {
				// Extract coordinates from GeoJSON
				decodedCoordinates = routeData.routes[0].geometry.coordinates.map(
					(coord: [number, number]) => [coord[1], coord[0]], // Convert from [lon, lat] to [lat, lon]
				);
			}
			// If we have a polyline encoded string
			else if (typeof encodedGeometry === "string") {
				decodedCoordinates = polyline.decode(encodedGeometry);
			} else {
				throw new Error("Unexpected geometry format in response");
			}

			const processedRoute = {
				coordinates: decodedCoordinates,
				distance: routeData.routes[0].summary.distance / 1000, // Convert to km
				duration: routeData.routes[0].summary.duration / 60, // Convert to minutes
			};

			setRoute(processedRoute);
			return processedRoute; // Make sure to return
		} catch (err) {
			setError("Failed to fetch route");
			return null;
		}
	};

	return { route, error, fetchRoute, setRoute };
}
