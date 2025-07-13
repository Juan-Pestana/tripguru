import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getServiceStations,
  getEVChargingPoints,
  getAllPOIs
} from "@/actions/getPois2";

// Define your zod schema for body parameters
const bodySchema = z.object({
  routeCoordinates: z.array(z.tuple([z.number(), z.number()])),
  fuel_type: z.string().optional(),
  connection_type: z.string().optional(),
  radius: z.number().optional()
});

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = bodySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { routeCoordinates, fuel_type, connection_type, radius } = result.data;

  try {
    let pois;

    if (fuel_type && connection_type) {
      pois = await getAllPOIs(
        routeCoordinates,
        fuel_type,
        connection_type,
        radius ?? 200
      );
    } else if (fuel_type) {
      pois = await getServiceStations(
        routeCoordinates,
        fuel_type,
        radius ?? 200
      );
    } else if (connection_type) {
      pois = await getEVChargingPoints(
        routeCoordinates,
        connection_type,
        radius ?? 500
      );
    } else {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json(pois);
  } catch (error) {
    console.error("Error fetching POIs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
