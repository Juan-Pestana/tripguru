"use client";

import type { EVStationDetails, StationDetails } from "@/actions/getPoyById";
import type { POI } from "@/types/types";
import ServiceStationPopup from "./station-popup";
import EVChargingStationPopup from "./Ev-station-popup";
import { Spinner } from "./ui/spinner";
import { divIcon } from "leaflet";

interface PopupComponentProps {
  station: POI & {
    details: EVStationDetails & StationDetails;
  };
}

export default function PopupComponent({ station }: PopupComponentProps) {
  if (station.type === "service_station") {
    return (
      <ServiceStationPopup
        station={{
          ...station,
          details: station.details as StationDetails
        }}
      />
    );
  }

  if (station.type === "ev_charging_point") {
    return (
      <EVChargingStationPopup
        station={{
          ...station,
          details: station.details as EVStationDetails
        }}
      />
    );
  }

  return null;
}
