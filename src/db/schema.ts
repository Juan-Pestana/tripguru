import { relations } from "drizzle-orm";
import {
	geometry,
	index,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
	decimal,
	numeric,
} from "drizzle-orm/pg-core";

export const locations = pgTable(
	"locations",
	{
		id: serial("id").primaryKey(),
		external_id: text("external_id").notNull(),
		name: text("name").notNull().default("unknown"),
		type: text("type").notNull().default("service_station"),
		location: geometry("location", {
			type: "point",
			mode: "xy",
			srid: 4326,
		}).notNull(),
		created_at: timestamp("created_at").notNull().defaultNow(),
		updated_at: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [
		index("spatial_index").using("gist", t.location),
		unique("locations_external_id_unique").on(t.external_id),
	],
);

export const locationRelations = relations(locations, ({ one }) => ({
	esInfo: one(es_info),
}));

export const es_info = pgTable(
	"es_info",
	{
		id: serial("id").primaryKey(),
		eess_id: text("eess_id")
			.notNull()
			.references(() => locations.external_id),
		cp: text("cp"),
		direccion: text("direccion"),
		horario: text("horario"),
		localidad: text("localidad"),
		provincia: text("provincia"),
		municipio: text("municipio"),
		idmunicipio: text("idmunicipio"),
		idprovincia: text("idprovincia"),
		idccaa: text("idccaa"),
		biodiesel: numeric("biodiesel"),
		bioetanol: numeric("bioetanol"),
		remision: text("remision"),
		gas_natural_comprimido: numeric("gas_natural_comprimido"),
		gas_natural_licuado: numeric("gas_natural_licuado"),
		glp: numeric("glp"),
		gasoleo_a: numeric("gasoleo_a"),
		gasoleo_b: numeric("gasoleo_b"),
		gasoleo_premium: numeric("gasoleo_premium"),
		gasolina_95_e10: numeric("gasolina_95_e10"),
		gasolina_95_e5: numeric("gasolina_95_e5"),
		gasolina_95_e5_premium: numeric("gasolina_95_e5_premium"),
		gasolina_98_e10: numeric("gasolina_98_e10"),
		gasolina_98_e5: numeric("gasolina_98_e5"),
		hidrogeno: numeric("hidrogeno"),
	},
	(t) => [
		// Add index on the foreign key
		unique("esinfo_eess_id_unique").on(t.eess_id),
		index("idx_esinfo_ideess").on(t.eess_id),
	],
);

export const esInfoRelations = relations(es_info, ({ one }) => ({
	location: one(locations, {
		fields: [es_info.eess_id],
		references: [locations.external_id],
	}),
}));

// {
// 	"DataProvider": {
// 	  "WebsiteURL": "http://openchargemap.org",
// 	  "Comments": null,
// 	  "DataProviderStatusType": {
// 		"IsProviderEnabled": true,
// 		"ID": 1,
// 		"Title": "Manual Data Entry"
// 	  },
// 	  "IsRestrictedEdit": false,
// 	  "IsOpenDataLicensed": true,
// 	  "IsApprovedImport": true,
// 	  "License": "Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0)",
// 	  "DateLastImported": null,
// 	  "ID": 1,
// 	  "Title": "Open Charge Map Contributors"
// 	},
// 	"OperatorInfo": {
// 	  "WebsiteURL": "https://www.iberdrola.es/clientes/hogar/movilidad-verde/recarga",
// 	  "Comments": null,
// 	  "PhonePrimaryContact": "900 22 45 22",
// 	  "PhoneSecondaryContact": null,
// 	  "IsPrivateIndividual": false,
// 	  "AddressInfo": null,
// 	  "BookingURL": null,
// 	  "ContactEmail": null,
// 	  "FaultReportEmail": null,
// 	  "IsRestrictedEdit": false,
// 	  "ID": 2247,
// 	  "Title": "Iberdrola | BP Pulse (ES)"
// 	},
// 	"UsageType": {
// 	  "IsPayAtLocation": false,
// 	  "IsMembershipRequired": true,
// 	  "IsAccessKeyRequired": true,
// 	  "ID": 4,
// 	  "Title": "Public - Membership Required"
// 	},
// 	"StatusType": {
// 	  "IsOperational": true,
// 	  "IsUserSelectable": true,
// 	  "ID": 50,
// 	  "Title": "Operational"
// 	},
// 	"SubmissionStatus": {
// 	  "IsLive": true,
// 	  "ID": 200,
// 	  "Title": "Submission Published"
// 	},
// 	"UserComments": null,
// 	"PercentageSimilarity": null,
// 	"MediaItems": null,
// 	"IsRecentlyVerified": true,
// 	"DateLastVerified": "2025-04-06T12:52:00Z",
// 	"ID": 311592,
// 	"UUID": "B8C2A0E5-9E1A-40EE-A067-BFD52B00B660",
// 	"ParentChargePointID": null,
// 	"DataProviderID": 1,
// 	"DataProvidersReference": null,
// 	"OperatorID": 2247,
// 	"OperatorsReference": null,
// 	"UsageTypeID": 4,
// 	"UsageCost": "DC: 0,54\u20AC/kWh - AC: 0,39\u20AC/kWh",
// 	"AddressInfo": {
// 	  "ID": 311981,
// 	  "Title": "Consum (Iberdrola)",
// 	  "AddressLine1": "Avda. Novelva",
// 	  "AddressLine2": null,
// 	  "Town": "Alicante",
// 	  "StateOrProvince": null,
// 	  "Postcode": null,
// 	  "CountryID": 210,
// 	  "Country": {
// 		"ISOCode": "ES",
// 		"ContinentCode": "EU",
// 		"ID": 210,
// 		"Title": "Spain"
// 	  },
// 	  "Latitude": 38.36619281455896,
// 	  "Longitude": -0.4965213345444397,
// 	  "ContactTelephone1": null,
// 	  "ContactTelephone2": null,
// 	  "ContactEmail": null,
// 	  "AccessComments": null,
// 	  "RelatedURL": null,
// 	  "Distance": null,
// 	  "DistanceUnit": 0
// 	},
// 	"Connections": [
// 	  {
// 		"ID": 600362,
// 		"ConnectionTypeID": 33,
// 		"ConnectionType": {
// 		  "FormalName": "IEC 62196-3 Configuration FF",
// 		  "IsDiscontinued": false,
// 		  "IsObsolete": false,
// 		  "ID": 33,
// 		  "Title": "CCS (Type 2)"
// 		},
// 		"Reference": null,
// 		"StatusTypeID": 50,
// 		"StatusType": {
// 		  "IsOperational": true,
// 		  "IsUserSelectable": true,
// 		  "ID": 50,
// 		  "Title": "Operational"
// 		},
// 		"LevelID": 3,
// 		"Level": {
// 		  "Comments": "40KW and Higher",
// 		  "IsFastChargeCapable": true,
// 		  "ID": 3,
// 		  "Title": "Level 3:  High (Over 40kW)"
// 		},
// 		"Amps": 300,
// 		"Voltage": 920,
// 		"PowerKW": 150,
// 		"CurrentTypeID": 30,
// 		"CurrentType": {
// 		  "Description": "Direct Current",
// 		  "ID": 30,
// 		  "Title": "DC"
// 		},
// 		"Quantity": 2,
// 		"Comments": null
// 	  },
// 	  {
// 		"ID": 600363,
// 		"ConnectionTypeID": 2,
// 		"ConnectionType": {
// 		  "FormalName": "IEC 62196-3 Configuration AA",
// 		  "IsDiscontinued": null,
// 		  "IsObsolete": null,
// 		  "ID": 2,
// 		  "Title": "CHAdeMO"
// 		},
// 		"Reference": null,
// 		"StatusTypeID": 50,
// 		"StatusType": {
// 		  "IsOperational": true,
// 		  "IsUserSelectable": true,
// 		  "ID": 50,
// 		  "Title": "Operational"
// 		},
// 		"LevelID": 3,
// 		"Level": {
// 		  "Comments": "40KW and Higher",
// 		  "IsFastChargeCapable": true,
// 		  "ID": 3,
// 		  "Title": "Level 3:  High (Over 40kW)"
// 		},
// 		"Amps": 200,
// 		"Voltage": 500,
// 		"PowerKW": 80,
// 		"CurrentTypeID": 30,
// 		"CurrentType": {
// 		  "Description": "Direct Current",
// 		  "ID": 30,
// 		  "Title": "DC"
// 		},
// 		"Quantity": 1,
// 		"Comments": null
// 	  }
// 	],
// 	"NumberOfPoints": 2,
// 	"GeneralComments": null,
// 	"DatePlanned": null,
// 	"DateLastConfirmed": null,
// 	"StatusTypeID": 50,
// 	"DateLastStatusUpdate": "2025-04-06T12:52:00Z",
// 	"MetadataValues": null,
// 	"DataQualityLevel": 1,
// 	"DateCreated": "2025-04-06T12:52:00Z",
// 	"SubmissionStatusTypeID": 200
//   },
