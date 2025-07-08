"use server";

import { db } from "@/db";
import {
  locations,
  connection_types,
  ev_details,
  station_ratings,
  station_categories
} from "@/db/schema";

import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export interface StationDetails {
  id: number;
  location_id: string;
  address: string;
  province: string;
  postalCode: string;
  city: string;
  schedule: string;
  rating: number | null;
  total_ratings: number;
  top_categories: {
    count: number;
    category: string;
  }[];
}

interface RatingQueryResult extends Record<string, unknown> {
  avg_rating: string | null;
  total_ratings: string;
  top_categories: string;
}

export async function getStationDetails(
  locationId: string
): Promise<StationDetails | null> {
  try {
    const [details, rating] = await Promise.all([
      db.query.locations.findFirst({
        where: eq(locations.external_id, locationId),
        with: {
          esInfo: true
        }
      }),
      db.execute<RatingQueryResult>(sql`
				WITH rating_stats AS (
				  SELECT
					AVG(rating)::numeric(2,1) as avg_rating,
					COUNT(*) as total_ratings
				  FROM ${station_ratings}
				  WHERE location_id = ${locationId}
				),
				category_counts AS (
				  SELECT
					sc.category,
					COUNT(*) as count
				  FROM ${station_ratings} sr
				  JOIN ${station_categories} sc ON sc.rating_id = sr.id
				  WHERE sr.location_id = ${locationId}
				  GROUP BY sc.category
				  ORDER BY count DESC
				  LIMIT 2
				)
				SELECT
				  rs.avg_rating,
				  rs.total_ratings,
				  CASE
					WHEN COUNT(cc.category) = 0 THEN NULL
					ELSE jsonb_agg(
					  jsonb_build_object(
						'category', cc.category,
						'count', cc.count
					  )
					)::text
				  END as top_categories
				FROM rating_stats rs
				LEFT JOIN category_counts cc ON true
				GROUP BY rs.avg_rating, rs.total_ratings
			  `)
    ]);

    if (!details || !details.esInfo) {
      return null;
    }

    const ratingData = rating.rows[0];

    return {
      id: details.id,
      location_id: details.external_id,
      address: details.esInfo.direccion || "",
      city: details.esInfo.localidad || "",
      province: details.esInfo.provincia || "",
      postalCode: details.esInfo.cp || "",
      schedule: details.esInfo.horario || "",
      rating: ratingData?.avg_rating
        ? Number.parseFloat(ratingData.avg_rating)
        : null,
      total_ratings: ratingData?.total_ratings
        ? Number.parseInt(ratingData.total_ratings, 10)
        : 0,
      top_categories: ratingData?.top_categories
        ? JSON.parse(ratingData.top_categories)
        : null
    };
  } catch (error) {
    console.error("Error fetching station details:", error);
    return null;
  }
}

export interface ConnectionType {
  type: string;
  power_kw: number | null;
  quantity: number;
  current_type: string | null;
}

export interface EVStationDetails {
  id: number;
  location_id: string;
  name: string;
  operator: string | null;
  usage_cost: string | null;
  address: string | null;
  city: string | null;
  access_type: string | null;
  is_operational: boolean;
  total_points: number | null;
  phone_number: string | null;
  last_verified: Date | null;
  connections: ConnectionType[];
}

export async function getEVStationDetails(
  locationId: string
): Promise<EVStationDetails | null> {
  try {
    const result = await db.execute(sql`
        SELECT
          l.id,
          l.external_id as location_id,
          l.name,
          ev.operator,
          ev.usage_cost,
          ev.address,
          ev.city,
          ev.access_type,
          ev.is_operational,
          ev.total_points,
          ev.phone_number,
          ev.last_verified,
          jsonb_agg(
            jsonb_build_object(
              'type', ct.connection_type,
              'power_kw', ct.power_kw,
              'quantity', ct.quantity,
              'current_type', ct.current_type
            )
          ) as connections
        FROM ${locations} l
        INNER JOIN ${ev_details} ev ON ev.location_id = l.external_id
        LEFT JOIN ${connection_types} ct ON ct.location_id = l.external_id
        WHERE l.external_id = ${locationId}
        AND l.type = 'ev_charging_point'
        GROUP BY
          l.id,
          l.external_id,
          l.name,
          ev.operator,
          ev.usage_cost,
          ev.address,
          ev.city,
          ev.access_type,
          ev.is_operational,
          ev.total_points,
          ev.phone_number,
          ev.last_verified
      `);

    if (!result.rows[0]) {
      return null;
    }

    const station = result.rows[0] as unknown as EVStationDetails;
    return {
      id: station.id,
      location_id: station.location_id,
      name: station.name,
      operator: station.operator,
      usage_cost: station.usage_cost,
      address: station.address,
      city: station.city,
      access_type: station.access_type,
      is_operational: station.is_operational,
      total_points: station.total_points ? Number(station.total_points) : null,
      phone_number: station.phone_number,
      last_verified: station.last_verified
        ? new Date(station.last_verified)
        : null,
      connections: station.connections.map((conn: ConnectionType) => ({
        type: conn.type,
        power_kw: conn.power_kw ? Number(conn.power_kw) : null,
        quantity: Number(conn.quantity) || 1,
        current_type: conn.current_type
      }))
    };
  } catch (error) {
    console.error("Error fetching EV station details:", error);
    return null;
  }
}
