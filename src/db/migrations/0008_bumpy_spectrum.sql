DROP INDEX "idx_esinfo_ideess";--> statement-breakpoint
DROP INDEX "spatial_index";--> statement-breakpoint
CREATE INDEX "idx_connection_type" ON "connection_types" USING btree ("connection_type");--> statement-breakpoint
CREATE INDEX "idx_location_connection" ON "connection_types" USING btree ("location_id","connection_type");--> statement-breakpoint
CREATE INDEX "idx_gasoleo_a" ON "es_info" USING btree ("gasoleo_a");--> statement-breakpoint
CREATE INDEX "idx_gasoleo_premium" ON "es_info" USING btree ("gasoleo_premium");--> statement-breakpoint
CREATE INDEX "idx_gasolina_95_e5" ON "es_info" USING btree ("gasolina_95_e5");--> statement-breakpoint
CREATE INDEX "idx_gasolina_98_e5" ON "es_info" USING btree ("gasolina_98_e5");--> statement-breakpoint
CREATE INDEX "idx_glp" ON "es_info" USING btree ("glp");--> statement-breakpoint
CREATE INDEX "idx_location_type" ON "locations" USING btree ("type");