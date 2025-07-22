import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet components (no SSR)
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

export default function MiniMap({
  coordinates
}: {
  coordinates: [number, number];
}) {
  // Fix Leaflet icon issue
  if (typeof window !== "undefined" && L.Icon.Default) {
    L.Icon.Default.mergeOptions({
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png"
    });
  }

  return (
    <div className="w-full h-32 rounded-md overflow-hidden my-2">
      <MapContainer
        center={coordinates}
        zoom={17}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={coordinates} />
      </MapContainer>
    </div>
  );
}
