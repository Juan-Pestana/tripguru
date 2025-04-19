import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Reverse geocode coordinates to address
export const reverseGeocode = async (
	lat: number,
	lng: number,
): Promise<string> => {
	// This would be replaced with an actual reverse geocoding API call
	// For demonstration, we'll return the coordinates as a string
	return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

// Function to determine if a station is on the right side of the road
export const isStationOnRightSide = (
	routeCoords: [number, number][],
	stationCoord: [number, number],
): boolean => {
	// Find the closest point on the route to the station
	let minDistance = Number.POSITIVE_INFINITY;
	let closestPointIndex = 0;

	for (let i = 0; i < routeCoords.length; i++) {
		const distance = calculateDistance(
			routeCoords[i][0],
			routeCoords[i][1],
			stationCoord[0],
			stationCoord[1],
		);
		if (distance < minDistance) {
			minDistance = distance;
			closestPointIndex = i;
		}
	}

	// If we're at the start of the route, we need at least one point ahead
	if (closestPointIndex === routeCoords.length - 1) {
		closestPointIndex = routeCoords.length - 2;
	}

	// Get direction vector of the route at this point
	const p1 = routeCoords[closestPointIndex];
	const p2 = routeCoords[closestPointIndex + 1];
	const dx = p2[0] - p1[0];
	const dy = p2[1] - p1[1];

	// Vector from route to station
	const sx = stationCoord[0] - p1[0];
	const sy = stationCoord[1] - p1[1];

	// Calculate cross product to determine side
	// If positive, station is on the right side of the route
	const cross = dx * sy - dy * sx;

	// If the cross product is positive, the station is on the right side of the route

	return cross > 0;
};

// Helper function to calculate distance between two points
export const calculateDistance = (
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number => {
	const R = 6371; // Radius of the Earth in km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c; // Distance in km
};
