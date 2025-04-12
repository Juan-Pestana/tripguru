import { db } from "@/db";
import { locations, ev_details, connection_types } from "@/db/schema";
import { sql } from "drizzle-orm";
import type { EVPoint } from "@/types/types";
import * as evPoints from "@/lib/charge_stations.json"; // You'll need to create this file with your EV data

async function seedEvPoints() {
	try {
		for (const point of evPoints as EVPoint[]) {
			const externalId = `ev_${point.ID}`;

			// Insert into locations table
			await db.execute(sql`
          INSERT INTO ${locations} (external_id, name, type, location)
          VALUES (
            ${externalId},
            ${point.AddressInfo?.Title || point.OperatorInfo?.Title || "Unknown"},
            'ev_charging_point',
            ST_SetSRID(ST_MakePoint(
              ${point.AddressInfo?.Longitude || 0}, 
              ${point.AddressInfo?.Latitude || 0}
            ), 4326)
          )
          ON CONFLICT (external_id) DO NOTHING;
        `);

			// Insert into ev_details table
			await db.execute(sql`
          INSERT INTO ${ev_details} (
            location_id,
            operator,
            usage_cost,
            address,
            city,
            access_type,
            is_operational,
            total_points,
            phone_number,
            last_verified
          )
          VALUES (
            ${externalId},
            ${point.OperatorInfo?.Title || null},
            ${point.UsageCost || null},
            ${point.AddressInfo?.AddressLine1 || null},
            ${point.AddressInfo?.Town || null},
            ${point.UsageType?.Title || null},
            ${point.StatusType?.IsOperational || false},
            ${point.NumberOfPoints || 0},
            ${point.OperatorInfo?.PhonePrimaryContact || null},
            ${point.DateLastVerified ? new Date(point.DateLastVerified) : null}
          )
          ON CONFLICT (location_id) DO NOTHING;
        `);

			// Delete existing connection types before inserting new ones
			await db.execute(sql`
          DELETE FROM ${connection_types}
          WHERE location_id = ${externalId};
        `);

			// Insert connection types with null checks
			if (point.Connections) {
				for (const conn of point.Connections) {
					if (conn) {
						// Check if connection exists
						await db.execute(sql`
                INSERT INTO ${connection_types} (
                  location_id,
                  connection_type,
                  power_kw,
                  quantity,
                  current_type
                )
                VALUES (
                  ${externalId},
                  ${conn.ConnectionType?.Title || "Unknown"},
                  ${conn.PowerKW || null},
                  ${conn.Quantity || 1},
                  ${conn.CurrentType?.Title || null}
                );
              `);
					}
				}
			}
		}

		console.log("EV charging points seeded successfully");

		// Verify the data
		const sample = await db.execute(sql`
        SELECT 
          l.id,
          l.name,
          l.type,
          ST_AsText(l.location) as location_text,
          ev.operator,
          ev.usage_cost,
          ct.connection_type,
          ct.power_kw
        FROM ${locations} l
        JOIN ${ev_details} ev ON ev.location_id = l.external_id
        LEFT JOIN ${connection_types} ct ON ct.location_id = l.external_id
        WHERE l.type = 'ev_charging_point'
        LIMIT 3;
      `);
		console.log("Sample of inserted EV data:", sample);
	} catch (error) {
		console.error("Error seeding EV charging points:", error);
		throw error;
	}
}

seedEvPoints();
