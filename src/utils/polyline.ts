/**
 * Decodes a polyline string to an array of coordinates.
 * This uses the algorithm created by Google for their Maps API
 * @param encoded - The encoded polyline string
 * @param precision - The precision (default: 5 for Google Maps, 6 for OSRM/ORS)
 * @returns Array of [latitude, longitude] coordinates
 */
export function decodePolyline(
	encoded: string,
	precision: number = 5,
): [number, number][] {
	const factor = Math.pow(10, precision);
	const coordinates: [number, number][] = [];

	let index = 0;
	let lat = 0;
	let lng = 0;

	while (index < encoded.length) {
		// Decode latitude
		let result = 1;
		let shift = 0;
		let b: number;

		do {
			b = encoded.charCodeAt(index++) - 63; // 63 is the char code for '?'
			result += (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20); // Continue until the 6th bit is not set

		lat += result & 1 ? ~(result >> 1) : result >> 1;

		// Decode longitude
		result = 1;
		shift = 0;

		do {
			b = encoded.charCodeAt(index++) - 63;
			result += (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);

		lng += result & 1 ? ~(result >> 1) : result >> 1;

		// Convert to actual coordinates
		coordinates.push([lat / factor, lng / factor]);
	}

	return coordinates;
}

/**
 * Encodes an array of coordinates to a polyline string
 * @param coordinates - Array of [latitude, longitude] coordinates
 * @param precision - The precision (default: 5 for Google Maps, 6 for OSRM/ORS)
 * @returns Encoded polyline string
 */
export function encodePolyline(
	coordinates: [number, number][],
	precision: number = 5,
): string {
	const factor = Math.pow(10, precision);
	let encoded = "";
	let prevLat = 0;
	let prevLng = 0;

	for (const [lat, lng] of coordinates) {
		// Round to precision and get delta from previous point
		const latRound = Math.round(lat * factor);
		const lngRound = Math.round(lng * factor);
		const deltaLat = latRound - prevLat;
		const deltaLng = lngRound - prevLng;
		prevLat = latRound;
		prevLng = lngRound;

		// Encode latitude
		encodeValue(deltaLat);

		// Encode longitude
		encodeValue(deltaLng);
	}

	return encoded;

	function encodeValue(value: number): void {
		// Left shift the binary value
		value = value < 0 ? ~(value << 1) : value << 1;

		// Break into 5-bit chunks starting from right
		while (value >= 0x20) {
			encoded += String.fromCharCode((0x20 | (value & 0x1f)) + 63);
			value >>= 5;
		}

		// Add the final chunk
		encoded += String.fromCharCode(value + 63);
	}
}
