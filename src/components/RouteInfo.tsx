import type { RouteData } from "@/types/types";

export function RouteInfo({
  route,

  isLoading,
  error
}: {
  route: RouteData | null;

  isLoading: boolean;
  error: string | undefined;
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
      <h3 className="font-bold mb-1">Información de viaje</h3>
      <p className="text-sm">
        Distancia:{" "}
        <span className="font-bold">{route.distance.toFixed(0)} km</span>
      </p>
      <p className="text-sm">
        Duración:{" "}
        <span className="font-bold ">
          {route.duration.toFixed(0)} min{" "}
        </span>{" "}
      </p>
    </div>
  );
}
