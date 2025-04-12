import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fuel, MapPin, Navigation, Zap } from "lucide-react";
import Image from "next/image";
import type { POI } from "@/actions/getPois2";

interface ServiceStationCardProps {
	station: POI;
	onClick: () => void;
}

export function ServiceStationCard({
	station,
	onClick,
}: ServiceStationCardProps) {
	return (
		<Card
			className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
			onClick={onClick}
		>
			<CardContent className="p-6">
				{/* Header */}
				<div className="flex items-start justify-between mb-4">
					<div className="space-y-2">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							{station.type === "service_station" ? (
								<Fuel className="h-5 w-5 text-blue-500" />
							) : (
								<Zap className="h-5 w-5 text-blue-500" />
							)}
							{station.name}
						</h3>
					</div>

					<Badge
						variant={station.side === "right" ? "default" : "secondary"}
						className="capitalize"
					>
						{station.side} side
					</Badge>
				</div>

				{/* Content */}
				<div className="flex items-start justify-between">
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Navigation className="h-4 w-4" />
							<span className="text-sm">{station.distance}m from road</span>
						</div>

						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<MapPin className="h-4 w-4" />
							<span>
								{(station.distanceAlongRoute / 1000).toFixed(1)} km from start
							</span>
						</div>
					</div>

					<div className="text-right">
						{/* Connection types for EV stations */}
						{station.type === "ev_charging_point" && station.connections && (
							<div className="flex gap-3 justify-end mb-2">
								{station.connections.map((conn, index) => (
									<div
										key={`${conn.type}-${index}`}
										className="flex items-center gap-1.5"
										title={`${conn.type} - ${conn.power_kw}kW (${conn.quantity}x)`}
									>
										<Image
											src={`/${conn.type}.svg`}
											alt={conn.type}
											width={24}
											height={24}
											className="opacity-75"
										/>
										<span className="text-sm text-muted-foreground">
											{conn.quantity}x / {conn.power_kw}kW
										</span>
									</div>
								))}
							</div>
						)}

						{/* Price */}
						<div className="space-y-1">
							<span className="text-xs text-muted-foreground">Price</span>
							<p className="text-lg font-semibold text-green-600">
								{station.type === "service_station"
									? `€${station.fuel_price}`
									: station.usage_cost}
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
