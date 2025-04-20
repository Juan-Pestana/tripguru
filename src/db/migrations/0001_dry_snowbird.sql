CREATE TABLE "connection_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"location_id" text NOT NULL,
	"connection_type" text NOT NULL,
	"power_kw" numeric,
	"quantity" numeric,
	"current_type" text
);
--> statement-breakpoint
CREATE TABLE "es_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"location_id" text NOT NULL,
	"cp" text,
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
	"gasoleo_a" numeric,
	"gasoleo_b" numeric,
	"gasoleo_premium" numeric,
	"gasolina_95_e10" numeric,
	"gasolina_95_e5" numeric,
	"gasolina_95_e5_premium" numeric,
	"gasolina_98_e10" numeric,
	"gasolina_98_e5" numeric,
	"hidrogeno" numeric,
	CONSTRAINT "esinfo_eess_id_unique" UNIQUE("location_id")
);
--> statement-breakpoint
CREATE TABLE "ev_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"location_id" text NOT NULL,
	"operator" text,
	"usage_cost" text,
	"address" text,
	"city" text,
	"access_type" text,
	"is_operational" boolean DEFAULT true,
	"total_points" numeric,
	"phone_number" text,
	"last_verified" timestamp,
	CONSTRAINT "ev_details_location_id_unique" UNIQUE("location_id")
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
CREATE TABLE "station_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"rating_id" integer NOT NULL,
	"category" text NOT NULL,
	"is_primary" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "station_ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"location_id" text NOT NULL,
	"rating" numeric NOT NULL,
	"appreciation" text,
	"recommendation" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "connection_types" ADD CONSTRAINT "connection_types_location_id_locations_external_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("external_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "es_info" ADD CONSTRAINT "es_info_location_id_locations_external_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("external_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ev_details" ADD CONSTRAINT "ev_details_location_id_locations_external_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("external_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_categories" ADD CONSTRAINT "station_categories_rating_id_station_ratings_id_fk" FOREIGN KEY ("rating_id") REFERENCES "public"."station_ratings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_ratings" ADD CONSTRAINT "station_ratings_location_id_locations_external_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("external_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_connection_type" ON "connection_types" USING btree ("connection_type");--> statement-breakpoint
CREATE INDEX "idx_location_connection" ON "connection_types" USING btree ("location_id","connection_type");--> statement-breakpoint
CREATE INDEX "idx_gasoleo_a" ON "es_info" USING btree ("gasoleo_a");--> statement-breakpoint
CREATE INDEX "idx_gasoleo_premium" ON "es_info" USING btree ("gasoleo_premium");--> statement-breakpoint
CREATE INDEX "idx_gasolina_95_e5" ON "es_info" USING btree ("gasolina_95_e5");--> statement-breakpoint
CREATE INDEX "idx_gasolina_98_e5" ON "es_info" USING btree ("gasolina_98_e5");--> statement-breakpoint
CREATE INDEX "idx_glp" ON "es_info" USING btree ("glp");--> statement-breakpoint
CREATE INDEX "idx_location_type" ON "locations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_station_categories_location_category" ON "station_categories" USING btree ("rating_id","category");--> statement-breakpoint
CREATE INDEX "idx_station_ratings_location" ON "station_ratings" USING btree ("location_id");