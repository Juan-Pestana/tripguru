import type { POI } from "@/types/types";

interface FetchPOIsOptions {
  selectedTypes: Set<string>;
  fuelType: string;
  connectionType: string;
  radius?: number;
}

export async function fetchPOIs(
  routeCoordinates: [number, number][],
  options: FetchPOIsOptions
): Promise<POI[]> {
  const { selectedTypes, fuelType, connectionType, radius = 200 } = options;

  const body = {
    routeCoordinates,
    fuel_type: selectedTypes.has("service_station") ? fuelType : undefined,
    connection_type: selectedTypes.has("ev_charging_point")
      ? connectionType
      : undefined,
    radius
  };

  const res = await fetch("/api/pois", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error("Failed to fetch POIs");
  }

  return res.json();
}
