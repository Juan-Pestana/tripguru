"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getRoute, type routeParams } from "@/actions/getRoute";
import type { RouteData } from "@/types/types";
import polyline from "@mapbox/polyline";

export interface RouteParams {
  origin: string;
  destination: string;
  currentLocation: {
    lat: number;
    lng: number;
  } | null;
}

// Fetcher for the API route
async function fetchRouteAPI(params: RouteParams) {
  try {
    const res = await fetch("/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      throw new Error("Failed to fetch route");
    }

    const routeData = await res.json();

    const encodedGeometry = routeData.routes[0].geometry;
    let decodedCoordinates: [number, number][];

    if (typeof encodedGeometry === "object") {
      // Extract coordinates from GeoJSON
      decodedCoordinates = routeData.routes[0].geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]] // Convert from [lon, lat] to [lat, lon]
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
      duration: routeData.routes[0].summary.duration / 60 // Convert to minutes
    };

    //setRoute(processedRoute);
    return processedRoute;
  } catch (error) {
    console.error("Error fetching route:", error);
    //setError(error);
    throw error; // Re-throw the error to be handled by the query
  }
}

export function useRoute(params: RouteParams | null) {
  //   setError(null);
  //   const routeData = await getRoute(params);

  const { data, error, isLoading } = useQuery({
    queryKey: ["route", params],
    queryFn: () => fetchRouteAPI(params!),
    enabled: !!params,
    staleTime: 1000 * 60 * 5
  });

  // Decode the geometry to get the coordinates

  // Make sure to return

  return { route: data, error, isLoading };
}
