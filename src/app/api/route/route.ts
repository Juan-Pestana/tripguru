import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const apiKey = process.env.OPENROUTES_API_KEY as string;

const bodySchema = z.object({
  origin: z.string(),
  destination: z.string(),
  currentLocation: z
    .object({
      lat: z.number(),
      lng: z.number()
    })
    .nullable()
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

  const { origin, destination, currentLocation } = result.data;

  // Helper to geocode an address
  const getCoordinates = async (address: string) => {
    const geocodeResponse = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(address)}`
    );
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.features && geocodeData.features.length > 0) {
      return geocodeData.features[0].geometry.coordinates;
    }
    throw new Error(`Could not find coordinates for ${address}`);
  };

  try {
    // Get coordinates
    const [originCoords, destCoords] = await Promise.all([
      currentLocation
        ? [currentLocation.lng, currentLocation.lat]
        : await getCoordinates(origin),
      await getCoordinates(destination)
    ]);

    // Fetch route
    const routeResponse = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        method: "POST",
        headers: {
          Accept:
            "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
          "Content-Type": "application/json",
          Authorization: apiKey
        },
        body: JSON.stringify({
          coordinates: [originCoords, destCoords]
        })
      }
    );

    const routeData = await routeResponse.json();
    return NextResponse.json(routeData);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
