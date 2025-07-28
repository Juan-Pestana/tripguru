"use client";
// components/MapComponent.tsx
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  type EVStationDetails,
  getEVStationDetails,
  getStationDetails,
  type StationDetails
} from "@/actions/getPoyById";
//import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useMap } from "react-leaflet";
import dynamic from "next/dynamic";

import "leaflet/dist/leaflet.css";

import type { POI } from "@/types/types";

import PopupComponent from "./PopupComponent";
import L from "leaflet";
import { set } from "zod";

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false
});
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

// Fix Leaflet default icon issue in Next.js
const fixLeafletIcon = () => {
  // Only run on client-side
  if (typeof window !== "undefined") {
    // @ts-ignore
    // biome-ignore lint/performance/noDelete: <explanation>
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png"
    });
  }
};

// Custom icons
const createServiceStationIcon = (isRightSide: boolean) => {
  return new L.Icon({
    iconUrl: isRightSide
      ? "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png" // Replace with actual icon
      : "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png", // Replace with actual icon
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41]
  });
};

interface MapComponentProps {
  route: [number, number][] | undefined;
  stations: POI[];
  isVisible: boolean;
  showRightSideOnly: boolean;
  selectedStation: string | null;
  setSelectedPOI: (poiId: string | null) => void;
}

// Map Bounds Adjuster component to auto-fit map to route
const MapBoundsAdjuster: React.FC<{
  route: [number, number][] | undefined;
  stations: POI[];
  isVisible: boolean;
}> = ({ route, stations }) => {
  const map = useMap();

  useEffect(() => {
    if (route && route.length > 0) {
      map.invalidateSize();
      const bounds = L.latLngBounds(route.map((coord) => [coord[0], coord[1]]));

      // Add station locations to bounds
      // biome-ignore lint/complexity/noForEach: <explanation>
      stations.forEach((station) => {
        bounds.extend([station.coordinates[0], station.coordinates[1]]);
      });

      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, route, stations]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({
  route,
  stations,
  showRightSideOnly,
  selectedStation,
  isVisible,
  setSelectedPOI
}) => {
  const [isClient, setIsClient] = useState(false);
  const [markers, setMarkers] = useState<{ [key: string]: L.Marker | null }>(
    {}
  );

  const [stationDetails, setStationDetails] = useState<
    (StationDetails & EVStationDetails) | null
  >(null);
  const mapRef = useRef<L.Map | null>(null);
  const currentOpenPopup = useRef<L.Marker | null>(null);

  useEffect(() => {
    setIsClient(true);
    fixLeafletIcon();
  }, []);

  useEffect(() => {
    const fetchStationDetails = async () => {
      console.log("Fetching station details for:", selectedStation);
      // Reset station details and close popup immediately
      //setStationDetails(null);
      if (currentOpenPopup.current) {
        currentOpenPopup.current.closePopup();
      }
      if (selectedStation && markers[selectedStation] && mapRef.current) {
        const marker = markers[selectedStation];

        const position = marker?.getLatLng();

        const stationsel = stations.find(
          (station) => station.id === selectedStation
        );

        // if (stationsel?.type === "service_station") {
        //   const details = await getStationDetails(stationsel.location_id);
        //   console.log("Fetched station details:", details);
        //   setStationDetails(details as StationDetails & EVStationDetails);
        // } else if (stationsel?.type === "ev_charging_point") {
        //   const details = await getEVStationDetails(stationsel.location_id);
        //   setStationDetails(details as StationDetails & EVStationDetails);
        // }

        if (position && marker && stationDetails) {
          //marker.openPopup();
          mapRef.current.flyTo(position, 15);
          currentOpenPopup.current = marker;
        }
      }
    };
    fetchStationDetails();
  }, [selectedStation, markers, stations]);

  if (!isClient) return <div>Loading map...</div>;

  // Default center (Madrid) if no route is provided
  const defaultCenter: [number, number] = [40.44136, -3.69751];

  const rightSideIcon = createServiceStationIcon(true);
  const leftSideIcon = createServiceStationIcon(false);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={16}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Route Polyline */}
      {route && (
        <Polyline
          positions={route.map((coord) => [coord[0], coord[1]])}
          color="blue"
          weight={5}
          opacity={0.7}
        />
      )}

      {/* Service Station Markers */}
      {stations.map((station) => (
        <Marker
          key={station.id}
          position={[station.coordinates[0], station.coordinates[1]]}
          icon={station.side === "derecho" ? rightSideIcon : leftSideIcon}
          eventHandlers={{
            click: () => {
              console.log("Marker clicked:", station.location_id);
              setSelectedPOI(station.id);
            }
          }}
          ref={(ref) => {
            if (ref) {
              markers[station.id] = ref;
            }
          }}
        >
          {/* <Popup className="w-[390px] p-1">
            {stationDetails && (
              <PopupComponent
                station={{
                  ...station,
                  details: stationDetails as StationDetails & EVStationDetails
                }}
              />
            )}
          </Popup> */}
        </Marker>
      ))}

      {/* Auto-adjust map bounds */}
      <MapBoundsAdjuster
        route={route}
        stations={stations}
        isVisible={isVisible}
      />
    </MapContainer>
  );
};

export default MapComponent;
