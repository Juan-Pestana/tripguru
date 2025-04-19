import React from "react";
import { Info } from "lucide-react";
import Image from "next/image";

export const getChargingTypeIcon = (type: string) => {
	// You can expand this with more specific icons based on your charging types
	if (type.includes("CCS"))
		return (
			<Image
				src={"/CCS (Type 2).svg"}
				alt={type}
				width={24}
				height={24}
				className="opacity-75"
			/>
		);
	if (type.includes("CHAdeMO"))
		return (
			<Image
				src={"/CHAdeMO.svg"}
				alt={type}
				width={24}
				height={24}
				className="opacity-75"
			/>
		);
	if (type.includes("Type 2"))
		return (
			<Image
				src={"/Type 2 (Socket Only).svg"}
				alt={type}
				width={24}
				height={24}
				className="opacity-75"
			/>
		);
	return <Info className="h-5 w-5" />;
};
