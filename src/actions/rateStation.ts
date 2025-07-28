"use server";

import { db } from "@/db";
import { station_ratings, station_categories } from "@/db/schema";
import { sql } from "drizzle-orm";

interface RateStationInput {
  locationId: string;
  rating: number;
  primaryCategory: string;
  secondaryCategory?: string;
  appreciation?: string;
  recommendation?: string;
}

export async function rateStation({
  locationId,
  rating,
  primaryCategory,
  secondaryCategory,
  appreciation,
  recommendation
}: RateStationInput): Promise<{ success: boolean; error?: string }> {
  try {
    // Insert the rating
    const [ratingResult] = await db
      .insert(station_ratings)
      .values({
        location_id: locationId,
        rating: sql`${rating}::numeric`,
        appreciation: appreciation || null,
        recommendation: recommendation || null
      })
      .returning({ id: station_ratings.id });

    // Throw an error if the rating insert fails
    if (!ratingResult?.id) {
      throw new Error("Failed to insert rating into station_ratings.");
    }

    // Insert primary category
    await db.insert(station_categories).values({
      rating_id: ratingResult.id,
      category: primaryCategory,
      is_primary: true
    });

    // Insert secondary category if provided
    if (secondaryCategory) {
      await db.insert(station_categories).values({
        rating_id: ratingResult.id,
        category: secondaryCategory,
        is_primary: false
      });
    }

    return { success: true };
  } catch (error) {
    // Log the error and return a failure response
    console.error("Error rating station:", error);
    return {
      success: false,
      error: "Failed to submit rating. Please try again."
    };
  }
}
