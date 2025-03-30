"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";
import { locations } from "@/db/schema";

export interface POI {
	id: string;
	name: string;
	coordinates: [number, number];
	distance: number;
	distanceAlongRoute: number;
	side: "left" | "right" | "unknown";
	fuel_price: number | null;  // Add price field
}

export async function getPOIsFromDatabase(
	routeCoordinates: [number, number][],
	radius = 200,
) {
	try {
		// Convert route coordinates to a PostGIS LineString
		const linestring = `LINESTRING(${routeCoordinates
			.map((coord) => `${coord[1]} ${coord[0]}`)
			.join(", ")})`;

			const pois = await db.execute(sql`
				WITH route AS (
				  SELECT ST_GeomFromText(${linestring}, 4326) as geom
				)
				SELECT 
				  l.id,
				  l.name,
				  ST_X(l.location::geometry) as longitude,
				  ST_Y(l.location::geometry) as latitude,
				  ST_LineLocatePoint(
					route.geom,
					l.location::geometry
				  ) * ST_Length(route.geom::geography) as distance_along_route,
				  ST_Distance(
					l.location::geometry::geography,
					route.geom::geography
				  ) as distance_from_route,
				  e.gasoleo_a as fuel_price
				FROM ${locations} l
				INNER JOIN es_info e ON e.eess_id = l.external_id
				CROSS JOIN route
				WHERE ST_DWithin(
				  l.location::geometry::geography,
				  route.geom::geography,
				  ${radius}
				)
				ORDER BY distance_along_route ASC;
			  `);

		// Format the results
		return pois.rows.map(
			(poi: any) =>
				({
					id: poi.id.toString(),
					name: poi.name,
					coordinates: [poi.latitude, poi.longitude] as [number, number],
					distance: Math.round(poi.distance_from_route), // perpendicular distance in meters
					distanceAlongRoute: Math.round(poi.distance_along_route), // distance from start in meters
					fuel_price: poi.fuel_price ? Number(poi.fuel_price) : null,
					side: "unknown" as const,
				}) as POI,
		);
	} catch (error) {
		console.error("Error fetching POIs from database:", error);
		throw new Error("Failed to fetch POIs from database");
	}
}
