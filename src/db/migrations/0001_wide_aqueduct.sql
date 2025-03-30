CREATE TABLE "es_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"eess_id" text NOT NULL,
	"CP" text,
	"direccion" text,
	"horario" text,
	"localidad" text,
	"provincia" text,
	"municipio" text,
	"idmunicipio" text,
	"idprovincia" text,
	"idccaa" text,
	"biodiesel" numeric,
	"bioetanol" numeric,
	"remision" text,
	"gas_natural_comprimido" numeric,
	"gas_natural_licuado" numeric,
	"glp" numeric,
	"gasoleo_A" numeric,
	"gasoleo_B" numeric,
	"gasoleo_Premium" numeric,
	"gasolina_95_E10" numeric,
	"gasolina_95_E5" numeric,
	"gasolina_95_E5_premium" numeric,
	"gasolina_98_E10" numeric,
	"gasolina_98_E5" numeric,
	"hidrogeno" numeric,
	CONSTRAINT "esinfo_eess_id_unique" UNIQUE("eess_id")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" text NOT NULL,
	"name" text DEFAULT 'unknown' NOT NULL,
	"type" text DEFAULT 'service_station' NOT NULL,
	"location" geometry(point) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "locations_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
ALTER TABLE "es_info" ADD CONSTRAINT "es_info_eess_id_locations_external_id_fk" FOREIGN KEY ("eess_id") REFERENCES "public"."locations"("external_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_esinfo_ideess" ON "es_info" USING btree ("eess_id");--> statement-breakpoint
CREATE INDEX "spatial_index" ON "locations" USING gist ("location");