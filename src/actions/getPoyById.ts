"use server";

import { db } from "@/db";
import { es_info, locations, ev_details, connection_types } from "@/db/schema";
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
}

export async function getStationDetails(
	locationId: string,
): Promise<StationDetails | null> {
	try {
		const result = await db.query.locations.findFirst({
			where: eq(locations.external_id, locationId),
			with: {
				esInfo: true,
			},
		});

		if (!result || !result.esInfo) {
			return null;
		}

		return {
			id: result.id,
			location_id: result.external_id,
			address: result.esInfo.direccion || "",
			city: result.esInfo.localidad || "",
			province: result.esInfo.provincia || "",
			postalCode: result.esInfo.cp || "",
			schedule: result.esInfo.horario || "",
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
	locationId: string,
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
				current_type: conn.current_type,
			})),
		};
	} catch (error) {
		console.error("Error fetching EV station details:", error);
		return null;
	}
}
