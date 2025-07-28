import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import type { Coordinates } from "@/types/types";
import { Label } from "./ui/label";

interface LocationInputProps {
  origin: string;
  destination: string;
  currentLocation: Coordinates | null;
  isLoadingLocation: boolean;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onGetCurrentLocation: () => void;
}

export function LocationInput({
  origin,
  destination,
  currentLocation,
  isLoadingLocation,
  onOriginChange,
  onDestinationChange,
  onGetCurrentLocation
}: LocationInputProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="origin"
          className="text-sm font-medium text-slate-700 flex items-center"
        >
          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
          Ciudad de origen
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ciudad de origen"
            value={origin}
            onChange={(e) => onOriginChange(e.target.value)}
            className="flex-grow"
            disabled={isLoadingLocation || currentLocation !== null}
          />
          <Button
            onClick={onGetCurrentLocation}
            disabled={isLoadingLocation || currentLocation !== null}
            variant={currentLocation ? "default" : "outline"}
            className="flex-shrink-0"
          >
            {isLoadingLocation ? "Getting..." : <MapPin size={18} />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="destination"
          className="text-sm font-medium text-slate-700 flex items-center"
        >
          <MapPin className="w-4 h-4 mr-2 text-green-600" />
          Ciudad de destino
        </Label>
        <Input
          placeholder="Ciudad de destino"
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value)}
        />
      </div>
    </div>
    // <div className="space-y-4">
    //   <div className="flex space-x-2">
    //     <Input
    //       placeholder="Ciudad de origen"
    //       value={origin}
    //       onChange={(e) => onOriginChange(e.target.value)}
    //       className="flex-grow"
    //       disabled={isLoadingLocation || currentLocation !== null}
    //     />
    //     <Button
    //       onClick={onGetCurrentLocation}
    //       disabled={isLoadingLocation || currentLocation !== null}
    //       variant={currentLocation ? "default" : "outline"}
    //       className="flex-shrink-0"
    //     >
    //       {isLoadingLocation ? "Getting..." : <MapPin size={18} />}
    //     </Button>
    //   </div>
    //   <div className="flex space-x-2">
    //     <Input
    //       placeholder="Ciudad de destino"
    //       value={destination}
    //       onChange={(e) => onDestinationChange(e.target.value)}
    //     />
    //   </div>
    // </div>
  );
}
