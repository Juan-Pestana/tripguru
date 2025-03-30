"use server";

import { db } from "@/db";
import { type InferSelectModel, sql } from "drizzle-orm";
import { type es_info, locations } from "@/db/schema";

// Define the return type from your tables
type Location = InferSelectModel<typeof locations>;
type EsInfo = InferSelectModel<typeof es_info>;

// Define interface for the query result
interface QueryResult {
	id: Location["id"];
	name: Location["name"];
	longitude: number;
	latitude: number;
	distance_along_route: number;
	distance_from_route: number;
	fuel_price: EsInfo[keyof Pick<
		EsInfo,
		| "gasoleo_a"
		| "gasoleo_premium"
		| "gasolina_95_e5"
		| "gasolina_98_e5"
		| "glp"
	>];
}

export interface POI {
	id: string;
	name: string;
	coordinates: [number, number];
	distance: number;
	distanceAlongRoute: number;
	side: "left" | "right" | "unknown";
	fuel_price: number | null; // Add price field
}

export async function getPOIsFromDatabase(
	routeCoordinates: [number, number][],
	fuel_type: string,
	radius = 200,
) {
	try {
		// Convert route coordinates to a PostGIS LineString
		const linestring = `LINESTRING(${routeCoordinates
			.map((coord) => `${coord[1]} ${coord[0]}`)
			.join(", ")})`;

		const fuelColumn = sql.identifier(fuel_type);

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
			  e.${fuelColumn} as fuel_price
			FROM ${locations} l
			INNER JOIN es_info e ON e.eess_id = l.external_id
			CROSS JOIN route
			WHERE ST_DWithin(
			  l.location::geometry::geography,
			  route.geom::geography,
			  ${radius}
			)
			AND e.${fuelColumn} IS NOT NULL
			ORDER BY distance_along_route ASC;
		  `);

		// Format the results

		return pois.rows.map(
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(poi: any) =>
				({
					id: poi.id.toString(),
					name: poi.name,
					coordinates: [poi.latitude, poi.longitude] as [number, number],
					distance: Math.round(poi.distance_from_route),
					distanceAlongRoute: Math.round(poi.distance_along_route),
					fuel_price: poi.fuel_price ? Number(poi.fuel_price) : null,
					side: "unknown" as const,
				}) as POI,
		);
	} catch (error) {
		console.error("Error fetching POIs from database:", error);
		throw new Error("Failed to fetch POIs from database");
	}
}
