import { relations } from "drizzle-orm";
import {
  geometry,
  index,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  numeric,
  boolean,
  integer
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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
      srid: 4326
    }).notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow()
  },
  (t) => [
    // 🛠 GIST index on geometry using raw SQL
    //customIndex("idx_location_gist").on(sql`USING gist ("location")`),
    sql`CREATE INDEX IF NOT EXISTS "idx_location_gist" ON "locations" USING gist ("location")`,
    index("idx_location_type").on(t.type),
    unique("locations_external_id_unique").on(t.external_id)
  ]
);

// Relations
export const locationRelations = relations(locations, ({ one }) => ({
  esInfo: one(es_info, {
    fields: [locations.external_id],
    references: [es_info.location_id]
  }),
  evDetails: one(ev_details, {
    fields: [locations.external_id],
    references: [ev_details.location_id]
  })
}));

export const es_info = pgTable(
  "es_info",
  {
    id: serial("id").primaryKey(),
    location_id: text("location_id")
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
    hidrogeno: numeric("hidrogeno")
  },
  (t) => [
    unique("esinfo_eess_id_unique").on(t.location_id),
    // Add indexes for commonly queried fuel types
    index("idx_gasoleo_a").on(t.gasoleo_a),
    index("idx_gasoleo_premium").on(t.gasoleo_premium),
    index("idx_gasolina_95_e5").on(t.gasolina_95_e5),
    index("idx_gasolina_98_e5").on(t.gasolina_98_e5),
    index("idx_glp").on(t.glp)
  ]
);

// For EV charging points
export const ev_details = pgTable(
  "ev_details",
  {
    id: serial("id").primaryKey(),
    location_id: text("location_id")
      .notNull()
      .references(() => locations.external_id),
    operator: text("operator"),
    usage_cost: text("usage_cost"),
    address: text("address"),
    city: text("city"),
    access_type: text("access_type"),
    is_operational: boolean("is_operational").default(true),
    total_points: numeric("total_points"),
    phone_number: text("phone_number"),
    last_verified: timestamp("last_verified")
  },
  (t) => [
    // Add unique constraint
    unique("ev_details_location_id_unique").on(t.location_id)
  ]
);

export const connection_types = pgTable(
  "connection_types",
  {
    id: serial("id").primaryKey(),
    location_id: text("location_id")
      .notNull()
      .references(() => locations.external_id),
    connection_type: text("connection_type").notNull(),
    power_kw: numeric("power_kw"),
    quantity: numeric("quantity"),
    current_type: text("current_type")
  },
  (t) => [
    // Add index for connection type queries
    index("idx_connection_type").on(t.connection_type),
    // Add composite index for location and connection type
    index("idx_location_connection").on(t.location_id, t.connection_type)
  ]
);

export const esInfoRelations = relations(es_info, ({ one }) => ({
  location: one(locations, {
    fields: [es_info.location_id],
    references: [locations.external_id]
  })
}));

export const evInfoRelations = relations(ev_details, ({ one }) => ({
  location: one(locations, {
    fields: [ev_details.location_id],
    references: [locations.external_id]
  })
}));

export const station_ratings = pgTable(
  "station_ratings",
  {
    id: serial("id").primaryKey(),
    location_id: text("location_id")
      .notNull()
      .references(() => locations.external_id),
    rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
    appreciation: text("appreciation"),
    recommendation: text("recommendation"),
    created_at: timestamp("created_at").notNull().defaultNow()
  },
  (t) => [
    // Index for faster lookups by location
    index("idx_station_ratings_location").on(t.location_id)
  ]
);

export const station_categories = pgTable(
  "station_categories",
  {
    id: serial("id").primaryKey(),
    rating_id: integer("rating_id")
      .notNull()
      .references(() => station_ratings.id),
    category: text("category").notNull(),
    is_primary: boolean("is_primary").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow()
  },
  (t) => [
    // Composite index for efficient category analysis
    index("idx_station_categories_location_category").on(
      t.rating_id,
      t.category
    )
  ]
);

// Add relations
export const stationRatingsRelations = relations(
  station_ratings,
  ({ one, many }) => ({
    location: one(locations, {
      fields: [station_ratings.location_id],
      references: [locations.external_id]
    }),
    categories: many(station_categories)
  })
);
