"use client";
import Image from "next/image";
import { MapPin, Star, ThumbsUp, Navigation } from "lucide-react";
import { getChargingTypeIcon } from "@/lib/componentUtils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { POI } from "@/types/types";
import type { EVStationDetails, StationDetails } from "@/actions/getPoyById";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import the Map component to avoid SSR issues with Leaflet
const MiniMap = dynamic(() => import("@/components/MiniMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      Cargando Mapa...
    </div>
  )
});

type ChargingPointType = {
  type: string;
  count: number;
  power: number;
  current: "AC" | "DC";
};

interface EVChargingStationPopupProps {
  station: POI & {
    details: EVStationDetails;
  };
}

export default function EVChargingStationPopup({
  station
}: EVChargingStationPopupProps) {
  // Helper function to get the appropriate icon for charging type

  if (
    !station.details.connections ||
    station.details.connections.length === 0
  ) {
    return null;
  }

  return (
    <Card className=" mx-auto px-4 relative py-2 gap-3 border-0 border-transparent shadow-transparent">
      {/* Triangle pointer at the bottom of the card */}

      <CardContent className="p-0 ">
        <div className="py-2">
          <MiniMap coordinates={station.coordinates} />

          <div className="flex justify-between items-center my-1">
            <Badge
              variant={
                station.details.access_type?.includes("Public")
                  ? "default"
                  : "outline"
              }
              className="text-xs"
            >
              {station.details.access_type}
            </Badge>
            <div className="flex items-center py-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="font-medium">
                {/* {station.details.rating.toFixed(1)} */}
                4.5
              </span>
              <span className="text-xs text-muted-foreground">/5</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="text-muted-foreground">Precio: </span>
              <span className="font-medium">{station.details.usage_cost}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Puntos: </span>
              <span className="font-medium">
                {station.details.total_points}
              </span>
            </div>
          </div>

          <div className="space-y-2 my-2">
            <p className="text-sm text-muted-foreground">Cargadores:</p>
            <div className="bg-muted rounded-md p-2 space-y-2">
              {station.details.connections.map((point, index) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  key={index}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1">
                    {getChargingTypeIcon(point.type)}
                    <span className="font-medium truncate">{point.type}</span>
                    <span className="text-muted-foreground">
                      ({point.quantity}x)
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">{point.power_kw} kW</span>
                    <Badge
                      variant="outline"
                      className="ml-1 text-[10px] px-1 py-0 h-4"
                    >
                      {point.current_type?.includes("DC") ? "DC" : "AC"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-4 pt-0 px-0">
        <Link
          className="w-full"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.coordinates[0]},${station.coordinates[1]}`}
        >
          <Button size="sm" className="w-full text-md cursor-pointer">
            <Navigation className="h-3.5 w-3.5 mr-1" />
            Llegar
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
