"use client";

import { MapPin, Clock, Star, ThumbsUp, Navigation } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ServiceStationPopupProps {
	station: {
		name: string;
		address: string;
		city: string;
		province: string;
		postalCode: string;
		openingHours: string;
		gasPrice: number;
		rating: number;
		bestCategories: string[];
		onRateClick?: () => void;
		onNavigateClick?: () => void;
	};
}

export default function ServiceStationPopup({
	station,
}: ServiceStationPopupProps) {
	const {
		name,
		address,
		city,
		province,
		postalCode,
		openingHours,
		gasPrice,
		rating,
		bestCategories,
		onRateClick = () => {},
		onNavigateClick = () => {},
	} = station;

	return (
		<Card className="w-[340px] relative py-2">
			{/* Triangle pointer at the bottom of the card */}

			<CardContent className="p-4">
				<div className="space-y-3">
					<div>
						<h3 className="font-bold text-lg">{name}</h3>
						<div className="flex items-center text-muted-foreground">
							<MapPin className="h-3.5 w-3.5 mr-1" />
							<p>
								{address}, {city}, {province}, {postalCode}
							</p>
						</div>
					</div>

					<div className="flex items-center ">
						<Clock className="h-3.5 w-3.5 mr-1" />
						<p>{openingHours}</p>
					</div>

					<div className="flex justify-between items-center">
						<div className="bg-muted px-2 py-1 rounded-md">
							<span className="font-semibold text-lg">
								${gasPrice.toFixed(2)}
							</span>
							<span className="text-xs text-muted-foreground">/L</span>
						</div>

						<div className="flex items-center">
							<Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
							<span className="font-medium">{rating.toFixed(1)}</span>
							<span className="text-xs text-muted-foreground">/5</span>
						</div>
					</div>

					<div className="flex flex-wrap gap-1">
						{bestCategories.map((category, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							<Badge key={index} variant="secondary" className="text-sm">
								{category}
							</Badge>
						))}
					</div>
				</div>
			</CardContent>

			<CardFooter className="flex gap-2 p-4 pt-0">
				<Button
					variant="outline"
					size="sm"
					className="flex-1 text-sm"
					onClick={onRateClick}
				>
					<ThumbsUp className="h-3.5 w-3.5 mr-1" />
					Rate Station
				</Button>
				<Button size="sm" className="flex-1 text-sm" onClick={onNavigateClick}>
					<Navigation className="h-3.5 w-3.5 mr-1" />
					Navigate
				</Button>
			</CardFooter>
		</Card>
	);
}
