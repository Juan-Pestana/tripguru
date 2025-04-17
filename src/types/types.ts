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
	glp: "GLP",
} as const;

export const CONNECTION_TYPES = {
	type2: "Type 2 (Socket Only)",
	ccs: "CCS (Type 2)",
	chademo: "CHAdeMO",
} as const;

// Define the return type from your tables
// type Location = InferSelectModel<typeof locations>;
// type EsInfo = InferSelectModel<typeof es_info>;

// Base types for all POIs
interface BasePOI {
	id: string;
	name: string;
	coordinates: [number, number];
	distance: number;
	distanceAlongRoute: number;
	side: "left" | "right" | "unknown";
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
