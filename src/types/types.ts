export interface Gasolinera {
  "C.P.": string;
  Dirección: string;
  Horario: string;
  Latitud: string;
  Localidad: string;
  "Longitud (WGS84)": string;
  Margen: string;
  Municipio: string;
  "Precio Biodiesel": string;
  "Precio Bioetanol": string;
  "Precio Gas Natural Comprimido": string;
  "Precio Gas Natural Licuado": string;
  "Precio Gases licuados del petróleo": string;
  "Precio Gasoleo A": string;
  "Precio Gasoleo B": string;
  "Precio Gasoleo Premium": string;
  "Precio Gasolina 95 E10": string;
  "Precio Gasolina 95 E5": string;
  "Precio Gasolina 95 E5 Premium": string;
  "Precio Gasolina 98 E10": string;
  "Precio Gasolina 98 E5": string;
  "Precio Hidrogeno": string;
  Provincia: string;
  Remisión: string;
  Rótulo: string;
  "Tipo Venta": string;
  "% BioEtanol": string;
  "% Éster metílico": string;
  IDEESS: string;
  IDMunicipio: string;
  IDProvincia: string;
  IDCCAA: string;
}

export interface EVPoint {
  ID: number;
  OperatorInfo: {
    Title: string;
    PhonePrimaryContact: string;
  };
  UsageType: {
    Title: string;
  };
  StatusType: {
    IsOperational: boolean;
  };
  UsageCost: string;
  AddressInfo: {
    ID: number;
    Title: string;
    AddressLine1: string;
    Town: string;
    Latitude: number;
    Longitude: number;
  };
  Connections: Array<{
    ConnectionType: {
      Title: string;
    };
    PowerKW: number;
    CurrentType: {
      Title: string;
    };
    Quantity: number;
  }>;
  NumberOfPoints: number;
  DateLastVerified: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteData {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

export type POIType = "service_station" | "ev_charging_point";

export const FUEL_TYPES = {
  gasoleo_a: "Diesel",
  gasoleo_premium: "Diesel Premium",
  gasolina_95_e5: "Gasolina 95",
  gasolina_95_e5_premium: "Gasolina 98",
  glp: "GLP"
} as const;

export const CONNECTION_TYPES = {
  "Type 2": "Type 2 (Socket Only)",
  CCS: "CCS (Type 2)",
  CHAdeMO: "CHAdeMO"
} as const;

// Define the return type from your tables
// type Location = InferSelectModel<typeof locations>;
// type EsInfo = InferSelectModel<typeof es_info>;

// Base types for all POIs
interface BasePOI {
  id: string;
  location_id: string;
  name: string;
  coordinates: [number, number];
  distance: number;
  distanceAlongRoute: number;
  side: "derecho" | "izquierdo" | "desconocido";
}

export interface ServiceStationPOI extends BasePOI {
  type: "service_station";
  fuel_price: number | null;
}

export interface EVChargingPOI extends BasePOI {
  type: "ev_charging_point";
  operator: string;
  usage_cost: string | null;
  access_type: string;
  is_operational: boolean;
  connections: Array<{
    type: string;
    power_kw: number;
    quantity: number;
  }>;
}

export type POI = ServiceStationPOI | EVChargingPOI;
