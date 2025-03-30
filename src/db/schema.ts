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
	numeric
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
	(t) => [index("spatial_index").using("gist", t.location),
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
		eess_id: text("eess_id").notNull().references(()=>locations.external_id),
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
	  index("idx_esinfo_ideess").on(t.eess_id)
	])

	export const esInfoRelations = relations(es_info, ({ one }) => ({
		location: one(locations, { fields: [es_info.eess_id], references: [locations.external_id] }),
	}));
	


