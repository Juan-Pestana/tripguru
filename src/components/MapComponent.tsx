"use client";
// components/MapComponent.tsx
import { useEffect, useState } from 'react';
//import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useMap } from 'react-leaflet';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then(mod => mod.Polyline),
  { ssr: false }
);


// Fix Leaflet default icon issue in Next.js
const fixLeafletIcon = () => {
  // Only run on client-side
  if (typeof window !== 'undefined') {
    // @ts-ignore
    // biome-ignore lint/performance/noDelete: <explanation>
        delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png'
    });
  }
};

// Custom icons
const createServiceStationIcon = (isRightSide: boolean) => {
  return new L.Icon({
    iconUrl: isRightSide 
      ? 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png' // Replace with actual icon
      : 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png', // Replace with actual icon
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]
  });
};

// Types
interface ServiceStation {
  id: string;
  name: string;
  coordinates: [number, number];
  distance: number;
  side: 'left' | 'right' | 'unknown';
}

interface MapComponentProps {
  route: [number, number][] | undefined;
  stations: ServiceStation[];
  showRightSideOnly: boolean;
}

// Map Bounds Adjuster component to auto-fit map to route
const MapBoundsAdjuster: React.FC<{
  route: [number, number][] | undefined;
  stations: ServiceStation[];
}> = ({ route, stations }) => {
  const map = useMap();
  
  useEffect(() => {
    if (route && route.length > 0) {
      const bounds = L.latLngBounds(route.map(coord => [coord[0], coord[1]]));
      
      // Add station locations to bounds
      // biome-ignore lint/complexity/noForEach: <explanation>
        stations.forEach(station => {
        bounds.extend([station.coordinates[0], station.coordinates[1]]);
      });
      
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, route, stations]);
  
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ route, stations, showRightSideOnly }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fixLeafletIcon();
  }, []);

  if (!isClient) return <div>Loading map...</div>;

  // Default center (London) if no route is provided
  const defaultCenter: [number, number] = [40.44136, -3.69751];
  
  const rightSideIcon = createServiceStationIcon(true);
  const leftSideIcon = createServiceStationIcon(false);

  return (
    <MapContainer 
      center={defaultCenter}
      zoom={16} 
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Route Polyline */}
      {route && (
        <Polyline 
          positions={route.map(coord => [coord[0], coord[1]])}
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
          icon={station.side === 'right' ? rightSideIcon : leftSideIcon}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{station.name}</h3>
              <p>Distance from route: {station.distance.toFixed(1)} km</p>
              <p>Side of road: {station.side === 'right' ? 'Right' : 'Left'}</p>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Auto-adjust map bounds */}
      <MapBoundsAdjuster route={route} stations={stations} />
    </MapContainer>
  );
};

export default MapComponent;