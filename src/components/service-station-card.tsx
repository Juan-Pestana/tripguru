import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fuel, MapPin, Navigation } from "lucide-react";
import { POI } from "@/actions/getPOIs";



export function ServiceStationCard({ station }: { station: POI }) {

    //console.log("ServiceStationCard", station);
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg p-2">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Fuel className="h-5 w-5 text-blue-500" />
              {station.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{(station.distanceAlongRoute / 1000).toFixed(1)} km from start</span>
            </div>
          </div>
          <Badge variant={station.side === "right" ? "default" : "secondary"} className="capitalize">
            {station.side} side
          </Badge>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{station.distance}m from route</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">Fuel Price</span>
            <span className="text-lg font-semibold text-green-600">€{station.fuel_price}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}