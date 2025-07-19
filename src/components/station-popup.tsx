"use client";

import { MapPin, Clock, Star, ThumbsUp, Navigation } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { POI } from "@/types/types";
import type { StationDetails } from "@/actions/getPoyById";

interface ServiceStationPopupProps {
  station: POI & {
    details: StationDetails;
  };
}

export default function ServiceStationPopup({
  station
}: ServiceStationPopupProps) {
  // Get the POI ID from the URL

  return (
    <Card className="w-[350px] relative py-2 gap-3 border-0 border-transparent shadow-transparent">
      <CardContent className="p-2">
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-lg">{station.name}</h3>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span className="my-2">
                {station?.details.address}, {station?.details.city},{" "}
                {station?.details.province}, {station?.details.postalCode}
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span className="my-1">
              {station?.details.schedule || "Opening hours not available"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="bg-muted px-2 py-1 rounded-md">
              <span className="font-semibold text-lg">
                {station.type === "service_station"
                  ? `${station.fuel_price?.toFixed(2)} €`
                  : "N/A"}
              </span>
              <span className="text-xs text-muted-foreground">/L</span>
            </div>
            {station.details.rating ? (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="font-medium text-lg">
                  {station.details.rating.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">/5</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                No ratings yet
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {station.details.top_categories ? (
              station.details.top_categories.map((category, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <Badge key={index} variant="secondary" className="text-xs">
                  {category.category}
                </Badge>
              ))
            ) : (
              <Badge variant="info" className="text-xs ">
                Be the first to rate this station!
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-4 pt-0">
        <Link href={`/rank/${station.location_id}`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-sm cursor-pointer"
          >
            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
            Vota esta estación
          </Button>
        </Link>

        <Link
          className="flex-1"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.coordinates[0]},${station.coordinates[1]}`}
        >
          <Button size="sm" className="w-full text-sm cursor-pointer">
            <Navigation className="h-3.5 w-3.5 mr-1" />
            Llegar
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
