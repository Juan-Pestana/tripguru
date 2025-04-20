import { db } from "@/db";
import { locations } from "@/db/schema";
import { sql } from "drizzle-orm";

import { eess } from "@/lib/gasolineras";

function parsePrice(price: string): number | null {
	if (!price || price.trim() === "") return null;
	const value = Number(price.replace(",", "."));

	return value;
}

async function seed() {
	try {
		for (const loc of eess) {
			const longitude = Number(loc["Longitud (WGS84)"].replace(",", "."));
			const latitude = Number(loc.Latitud.replace(",", "."));

			if (!Number.isNaN(longitude) && !Number.isNaN(latitude)) {
				await db.execute(sql`
				  INSERT INTO ${locations} (external_id, name, type, location)
				  VALUES (
					${loc.IDEESS},
					${loc.Rótulo},
					'service_station',
					ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
				  );
				`);

				await db.execute(sql`
				  INSERT INTO es_info (location_id, cp, direccion, horario, localidad, provincia, municipio, idmunicipio, idprovincia, idccaa, biodiesel, bioetanol, remision, gas_natural_comprimido, gas_natural_licuado, glp, gasoleo_a, gasoleo_b, gasoleo_premium, gasolina_95_e10, gasolina_95_e5, gasolina_95_e5_premium, gasolina_98_e10, gasolina_98_e5, hidrogeno)
				  VALUES (
					${loc.IDEESS},
            ${loc["C.P."]},
            ${loc.Dirección},
            ${loc.Horario},
            ${loc.Localidad},
            ${loc.Provincia},
            ${loc.Municipio},
            ${loc.IDMunicipio},
            ${loc.IDProvincia},
            ${loc.IDCCAA},
            ${parsePrice(loc["Precio Biodiesel"])},
            ${parsePrice(loc["Precio Bioetanol"])},
            ${loc.Remisión},
            ${parsePrice(loc["Precio Gas Natural Comprimido"])},
            ${parsePrice(loc["Precio Gas Natural Licuado"])},
            ${parsePrice(loc["Precio Gases licuados del petróleo"])},
            ${parsePrice(loc["Precio Gasoleo A"])},
            ${parsePrice(loc["Precio Gasoleo B"])},
            ${parsePrice(loc["Precio Gasoleo Premium"])},
            ${parsePrice(loc["Precio Gasolina 95 E10"])},
            ${parsePrice(loc["Precio Gasolina 95 E5"])},
            ${parsePrice(loc["Precio Gasolina 95 E5 Premium"])},
            ${parsePrice(loc["Precio Gasolina 98 E10"])},
            ${parsePrice(loc["Precio Gasolina 98 E5"])},
            ${parsePrice(loc["Precio Hidrogeno"])}
					
					)
				`);
			} else {
				console.warn(`Invalid coordinates for station ${loc.Rótulo}`);
			}
		}
		console.log("Seed completed successfully");

		// Verify the data
		const sample = await db.execute(sql`
	  SELECT id, name, ST_AsText(location) as location_text
	  FROM ${locations}
	  LIMIT 3;
	`);
		console.log("Sample of inserted data:", sample);
	} catch (error) {
		console.error("Error seeding database:", error);
		throw error;
	}
}

seed();
