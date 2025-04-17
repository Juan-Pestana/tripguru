import type { RouteData } from "@/types/types";

export function RouteInfo({
	route,

	isLoading,
	error,
}: {
	route: RouteData | null;

	isLoading: boolean;
	error: string | null;
}) {
	if (isLoading) {
		return <div className="text-center">Loading route...</div>;
	}

	if (error) {
		return <div className="text-red-500 text-center">{error}</div>;
	}

	if (!route) {
		return null;
	}

	return (
		<div className="mt-4 p-3 bg-gray-50 rounded-md">
			<h3 className="font-bold mb-1">Route Information</h3>
			<p className="text-sm">Distance: {route.distance.toFixed(1)} km</p>
			<p className="text-sm">Duration: {route.duration.toFixed(0)} min</p>
		</div>
	);
}
