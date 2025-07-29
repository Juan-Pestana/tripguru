"use server";

import { db } from "@/db";
import { type InferSelectModel, sql } from "drizzle-orm";
import { type es_info, locations } from "@/db/schema";

// Define the return type from your tables
type Location = InferSelectModel<typeof locations>;
type EsInfo = InferSelectModel<typeof es_info>;

// Base types for all POIs
interface BasePOI {
  id: string;
  name: string;
  location_id: string;
  coordinates: [number, number];
  distance: number;
  distanceAlongRoute: number;
  side: "left" | "right" | "unknown";
}

export interface ServiceStationPOI extends BasePOI {
  type: "service_station";
  fuel_price: number | null;
}

export interface EVChargingPOI extends BasePOI {
  type: "ev_charging_point";
  operator: string;
  usage_cost: string | null;
  access_type: string;
  is_operational: boolean;
  connections: Array<{
    type: string;
    power_kw: number;
    quantity: number;
  }>;
}

export type POI = ServiceStationPOI | EVChargingPOI;

// Get only service stations
export async function getServiceStations(
  routeCoordinates: [number, number][],
  fuel_type: string,
  radius = 200
): Promise<ServiceStationPOI[]> {
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
        l.external_id,
        ST_X(l.location::geometry) as longitude,
        ST_Y(l.location::geometry) as latitude,
        ST_LineLocatePoint(route.geom, l.location::geometry) *
          ST_Length(route.geom::geography) as distance_along_route,
        ST_Distance(l.location::geometry::geography, route.geom::geography)
          as distance_from_route,
        e.${fuelColumn} as fuel_price
      FROM ${locations} l
      INNER JOIN es_info e ON e.location_id = l.external_id
      CROSS JOIN route
      WHERE ST_DWithin(l.location::geometry::geography, route.geom::geography, ${radius})
      AND l.type = 'service_station'
      AND e.${fuelColumn} IS NOT NULL
      ORDER BY distance_along_route ASC;
    `);

  return pois.rows.map(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (poi: any) => ({
      id: poi.id.toString(),
      location_id: poi.external_id,
      name: poi.name,
      type: "service_station" as const,
      coordinates: [poi.latitude, poi.longitude],
      distance: Math.round(poi.distance_from_route),
      distanceAlongRoute: Math.round(poi.distance_along_route),
      fuel_price: poi.fuel_price ? Number(poi.fuel_price) : null,
      side: "unknown"
    })
  );
}

// Get only EV charging points
export async function getEVChargingPoints(
  routeCoordinates: [number, number][],
  connection_type: string,
  radius = 500
): Promise<EVChargingPOI[]> {
  const linestring = `LINESTRING(${routeCoordinates
    .map((coord) => `${coord[1]} ${coord[0]}`)
    .join(", ")})`;

  const pois = await db.execute(sql`
            WITH route AS (
              SELECT ST_GeomFromText(${linestring}, 4326) as geom
            )
            SELECT
              l.id,
              l.external_id,
              l.name,
              ST_X(l.location::geometry) as longitude,
              ST_Y(l.location::geometry) as latitude,
              ST_LineLocatePoint(route.geom, l.location::geometry) *
                ST_Length(route.geom::geography) as distance_along_route,
              ST_Distance(l.location::geometry::geography, route.geom::geography)
                as distance_from_route,
              ev.operator,
              ev.usage_cost,
              ev.access_type,
              ev.is_operational,
              jsonb_agg(jsonb_build_object(
                'type', ct.connection_type,
                'power_kw', ct.power_kw,
                'quantity', ct.quantity
              )) as connections
            FROM ${locations} l
            CROSS JOIN route
            INNER JOIN ev_details ev ON ev.location_id = l.external_id
            INNER JOIN connection_types ct ON ct.location_id = l.external_id
            WHERE ST_DWithin(l.location::geometry::geography, route.geom::geography, ${radius})
            AND l.type = 'ev_charging_point'
            AND ct.connection_type = ${connection_type}
            GROUP BY
              l.id,
              l.name,
              l.location,
              ev.operator,
              ev.usage_cost,
              ev.access_type,
              ev.is_operational,
              route.geom
            ORDER BY distance_along_route ASC;
          `);

  return pois.rows.map(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (poi: any) => ({
      id: poi.id.toString(),
      location_id: poi.external_id,
      name: poi.name,
      type: "ev_charging_point" as const,
      coordinates: [poi.latitude, poi.longitude],
      distance: Math.round(poi.distance_from_route),
      distanceAlongRoute: Math.round(poi.distance_along_route),
      operator: poi.operator,
      usage_cost: poi.usage_cost,
      access_type: poi.access_type,
      is_operational: poi.is_operational,
      connections: poi.connections,
      side: "unknown"
    })
  );
}

// Get both types of POIs
export async function getAllPOIs(
  routeCoordinates: [number, number][],
  fuel_type: string,
  connection_type: string,
  radius = 200
): Promise<POI[]> {
  const linestring = `LINESTRING(${routeCoordinates
    .map((coord) => `${coord[1]} ${coord[0]}`)
    .join(", ")})`;

  const fuelColumn = sql.identifier(fuel_type);

  const pois = await db.execute(sql`

      WITH route AS (
        SELECT ST_GeomFromText(${linestring}, 4326) as geom
      ),
      service_stations AS (
        SELECT
          l.id,
          l.external_id,
          l.name,
          l.type,
          ST_X(l.location::geometry) as longitude,
          ST_Y(l.location::geometry) as latitude,
          ST_LineLocatePoint(route.geom, l.location::geometry) *
            ST_Length(route.geom::geography) as distance_along_route,
          ST_Distance(l.location::geometry::geography, route.geom::geography)
            as distance_from_route,
          e.${fuelColumn} as fuel_price,
          NULL::jsonb as ev_data
        FROM ${locations} l
        INNER JOIN es_info e ON e.location_id = l.external_id
        CROSS JOIN route
        WHERE ST_DWithin(l.location::geometry::geography, route.geom::geography, ${radius})
        AND l.type = 'service_station'
        AND e.${fuelColumn} IS NOT NULL
      ),
      ev_points AS (
  SELECT
    l.id,
    l.external_id,
    l.name,
    l.type,
    ST_X(l.location::geometry) as longitude,
    ST_Y(l.location::geometry) as latitude,
    ST_LineLocatePoint(route.geom, l.location::geometry) *
      ST_Length(route.geom::geography) as distance_along_route,
    ST_Distance(l.location::geometry::geography, route.geom::geography)
      as distance_from_route,
    NULL::numeric as fuel_price,
    jsonb_build_object(
      'operator', ev.operator,
      'usage_cost', ev.usage_cost,
      'access_type', ev.access_type,
      'is_operational', ev.is_operational,
      'connections', jsonb_agg(jsonb_build_object(
        'type', ct.connection_type,
        'power_kw', ct.power_kw,
        'quantity', ct.quantity
      ))
    ) as ev_data
  FROM ${locations} l
  CROSS JOIN route
  INNER JOIN ev_details ev ON ev.location_id = l.external_id
  INNER JOIN connection_types ct ON ct.location_id = l.external_id
  WHERE ST_DWithin(l.location::geometry::geography, route.geom::geography, ${radius})
  AND l.type = 'ev_charging_point'
  AND ct.connection_type = ${connection_type}
  GROUP BY
    l.id,
    l.name,
    l.type,
    l.location,
    ev.operator,
    ev.usage_cost,
    ev.access_type,
    ev.is_operational,
    route.geom
)
      SELECT * FROM service_stations
      UNION ALL
      SELECT * FROM ev_points
      ORDER BY distance_along_route ASC;
    `);

  return pois.rows.map(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (poi: any) => {
      const base = {
        id: poi.id.toString(),
        location_id: poi.external_id,
        name: poi.name,
        coordinates: [poi.latitude, poi.longitude] as [number, number],
        distance: Math.round(poi.distance_from_route),
        distanceAlongRoute: Math.round(poi.distance_along_route),
        side: "unknown" as const
      };

      if (poi.type === "service_station") {
        return {
          ...base,
          type: "service_station" as const,
          fuel_price: poi.fuel_price ? Number(poi.fuel_price) : null
        };
      }
      const evData = poi.ev_data;
      return {
        ...base,
        type: "ev_charging_point" as const,
        operator: evData.operator,
        usage_cost: evData.usage_cost,
        access_type: evData.access_type,
        is_operational: evData.is_operational,
        connections: evData.connections
      };
    }
  );
}
