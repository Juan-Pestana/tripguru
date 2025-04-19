"use server";

export interface routeParams {
	origin: string;
	destination: string;
	currentLocation: {
		lat: number;
		lng: number;
	} | null;
}

const apiKey = process.env.OPENROUTES_API_KEY as string;

export const getRoute = async ({
	origin,
	destination,
	currentLocation,
}: routeParams) => {
	// 1. Fetch coordinates for origin and destination
	const getCoordinates = async (address: string) => {
		const geocodeResponse = await fetch(
			`https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(address)}`,
		);
		const geocodeData = await geocodeResponse.json();

		if (geocodeData.features && geocodeData.features.length > 0) {
			return geocodeData.features[0].geometry.coordinates;
		}
		throw new Error(`Could not find coordinates for ${address}`);
	};

	// Get coordinates
	const [originCoords, destCoords] = await Promise.all([
		currentLocation
			? [currentLocation.lng, currentLocation.lat]
			: // biome-ignore lint/style/noNonNullAssertion: <explanation>
				getCoordinates(origin!),
		getCoordinates(destination),
	]);

	// 2. Fetch route using OpenRouteService
	const routeResponse = await fetch(
		"https://api.openrouteservice.org/v2/directions/driving-car",
		{
			method: "POST",
			headers: {
				Accept:
					"application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
				"Content-Type": "application/json",
				Authorization: apiKey,
			},
			body: JSON.stringify({
				coordinates: [originCoords, destCoords],
			}),
		},
	);

	//console.log("this is routeData", await routeResponse.json());
	const routeData = await routeResponse.json();

	console.log(routeData);
	//console.log("this is routeData", routeData);
	return routeData;
};
