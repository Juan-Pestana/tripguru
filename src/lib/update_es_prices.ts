//import fetch from "node-fetch";
import * as fs from "fs";
import { Client } from "pg";
import { pipeline } from "stream/promises";
import { stringify } from "csv-stringify/sync";
import { from as copyFrom } from "pg-copy-streams";
import "dotenv/config";

const API_URL =
  "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/";
const CSV_PATH = "es_info.csv";
const DATABASE_URL = process.env.DATABASE_URL;

function parsePrice(price: string): number | null {
  if (!price || price.trim() === "") return null;
  // If not a valid number after replacing comma, return null
  const cleaned = price.replace(",", ".");
  const value = Number(cleaned);
  if (isNaN(value)) return null;
  return value;
}

const client = new Client({ connectionString: DATABASE_URL });

async function fetchAndSaveCSV() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`Failed to fetch API: ${res.statusText}`);
  const data = await res.json();

  const { rows: existingLocations } = await client.query(
    `SELECT external_id FROM locations WHERE type = 'service_station'`
  );
  const existingIds = new Set(
    existingLocations.map((row: any) => row.external_id)
  );
  const apiRecords = data.ListaEESSPrecio;
  const newLocations = apiRecords.filter(
    (loc: any) => !existingIds.has(loc.IDEESS)
  );

  console.log(
    `Found ${newLocations.length} new locations to insert into the database`
  );

  for (const loc of newLocations) {
    const longitude = Number(loc["Longitud (WGS84)"].replace(",", "."));
    const latitude = Number(loc.Latitud.replace(",", "."));
    if (!Number.isNaN(longitude) && !Number.isNaN(latitude)) {
      await client.query(
        `INSERT INTO locations (external_id, name, type, location)
       VALUES ($1, $2, 'service_station', ST_SetSRID(ST_MakePoint($3, $4), 4326))`,
        [loc.IDEESS, loc.Rótulo, longitude, latitude]
      );
    }
  }

  // Prepare CSV data
  console.log("Preparing CSV data...");

  const columns = [
    "location_id",
    "cp",
    "direccion",
    "horario",
    "localidad",
    "provincia",
    "municipio",
    "idmunicipio",
    "idprovincia",
    "idccaa",
    "biodiesel",
    "bioetanol",
    "remision",
    "gas_natural_comprimido",
    "gas_natural_licuado",
    "glp",
    "gasoleo_a",
    "gasoleo_b",
    "gasoleo_premium",
    "gasolina_95_e10",
    "gasolina_95_e5",
    "gasolina_95_e5_premium",
    "gasolina_98_e10",
    "gasolina_98_e5",
    "hidrogeno"
  ];

  const records = data.ListaEESSPrecio.map((loc: any) => [
    loc.IDEESS,
    loc["C.P."],
    loc.Dirección,
    loc.Horario,
    loc.Localidad,
    loc.Provincia,
    loc.Municipio,
    loc.IDMunicipio,
    loc.IDProvincia,
    loc.IDCCAA,
    parsePrice(loc["Precio Biodiesel"]),
    parsePrice(loc["Precio Bioetanol"]),
    loc.Remisión,
    parsePrice(loc["Precio Gas Natural Comprimido"]),
    parsePrice(loc["Precio Gas Natural Licuado"]),
    parsePrice(loc["Precio Gases licuados del petróleo"]),
    parsePrice(loc["Precio Gasoleo A"]),
    parsePrice(loc["Precio Gasoleo B"]),
    parsePrice(loc["Precio Gasoleo Premium"]),
    parsePrice(loc["Precio Gasolina 95 E10"]),
    parsePrice(loc["Precio Gasolina 95 E5"]),
    parsePrice(loc["Precio Gasolina 95 E5 Premium"]),
    parsePrice(loc["Precio Gasolina 98 E10"]),
    parsePrice(loc["Precio Gasolina 98 E5"]),
    parsePrice(loc["Precio Hidrogeno"])
  ]);

  console.log("Fetched records:", records.slice(0, 5)); // Log first 5 records for debugging

  const csv = stringify(records, {
    header: true,
    columns: columns,
    delimiter: ",",
    quoted: true
  });
  //const csv = stringify(fileCont, { header: true, quoted: true });
  fs.writeFileSync(CSV_PATH, csv);
  console.log("CSV saved:", CSV_PATH);
}

async function truncateAndCopy() {
  await client.query("TRUNCATE es_info;");
  // Use COPY FROM STDIN for best performance
  const copyQuery = `
  COPY es_info (
    location_id, cp, direccion, horario, localidad, provincia, municipio, idmunicipio, idprovincia, idccaa,
    biodiesel, bioetanol, remision, gas_natural_comprimido, gas_natural_licuado, glp, gasoleo_a, gasoleo_b,
    gasoleo_premium, gasolina_95_e10, gasolina_95_e5, gasolina_95_e5_premium, gasolina_98_e10, gasolina_98_e5, hidrogeno
  )
  FROM STDIN WITH (FORMAT csv, HEADER true)
`;
  const fileStream = fs.createReadStream(CSV_PATH);
  const dbStream = client.query(copyFrom(copyQuery));
  await pipeline(fileStream, dbStream);

  console.log("es_info table refreshed!");
}

async function main() {
  await client.connect();
  await fetchAndSaveCSV();
  await truncateAndCopy();
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
