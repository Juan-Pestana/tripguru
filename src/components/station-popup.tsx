"use client";

import { MapPin, Clock, Star, ThumbsUp, Navigation } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { POI } from "@/types/types";
import type { EVStationDetails, StationDetails } from "@/actions/getPoyById";

interface ServiceStationPopupProps {
	station: POI & {
		details: StationDetails;
	};
}

export default function ServiceStationPopup({
	station,
}: ServiceStationPopupProps) {
	// Get the POI ID from the URL

	const bestCategories = ["Kids friendly", "Food & drink"];

	return (
		<Card className="w-[350px] relative py-2 gap-3 border-0 border-transparent shadow-transparent">
			<CardContent className="p-2">
				<div className="space-y-3">
					<div>
						<h3 className="font-bold text-lg">{station.name}</h3>
						<div className="flex items-center text-muted-foreground">
							<MapPin className="h-3.5 w-3.5 mr-1" />
							<span className="my-2">
								{station?.details.address}, {station?.details.city},{" "}
								{station?.details.province}, {station?.details.postalCode}
							</span>
						</div>
					</div>

					<div className="flex items-center">
						<Clock className="h-3.5 w-3.5 mr-1" />
						<span className="my-1">
							{station?.details.schedule || "Opening hours not available"}
						</span>
					</div>

					<div className="flex justify-between items-center">
						<div className="bg-muted px-2 py-1 rounded-md">
							<span className="font-semibold text-lg">
								{station.type === "service_station"
									? `${station.fuel_price?.toFixed(2)} €`
									: "N/A"}
							</span>
							<span className="text-xs text-muted-foreground">/L</span>
						</div>
						<div className="flex items-center">
							<Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
							<span className="font-medium text-lg">
								{/* {rating.toFixed(1)} */}5
							</span>
							<span className="text-xs text-muted-foreground">/5</span>
						</div>
					</div>
					<div className="flex flex-wrap gap-1">
						{bestCategories.map((category, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							<Badge key={index} variant="secondary" className="text-xs">
								{category}
							</Badge>
						))}
					</div>
				</div>
			</CardContent>

			<CardFooter className="flex gap-2 p-4 pt-0">
				<Button variant="outline" size="sm" className="flex-1 text-sm">
					<ThumbsUp className="h-3.5 w-3.5 mr-1" />
					Rate Station
				</Button>
				<Link
					className="flex-1"
					target="_blank"
					rel="noopener noreferrer"
					href={`https://www.google.com/maps/dir/?api=1&destination=${station.coordinates[0]},${station.coordinates[1]}`}
				>
					<Button size="sm" className="w-full text-sm cursor-pointer">
						<Navigation className="h-3.5 w-3.5 mr-1" />
						Navigate
					</Button>
				</Link>
			</CardFooter>
		</Card>
	);
}
