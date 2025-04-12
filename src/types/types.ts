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
