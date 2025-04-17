import type { POI } from "@/types/types";
import { ServiceStationCard } from "./service-station-card";

interface POIListProps {
	pois: POI[];
	showRightSideOnly: boolean;
	onPOIClick: (id: string) => void;
	onFilterChange: (showRight: boolean) => void;
}

export function POIList({
	pois,
	showRightSideOnly,
	onPOIClick,
	onFilterChange,
}: POIListProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-bold">
					{showRightSideOnly ? "POIs (Right Side Only)" : "All POIs"}
				</h3>
				<div className="flex items-center space-x-2">
					<input
						type="checkbox"
						id="rightSideOnly"
						checked={showRightSideOnly}
						onChange={(e) => onFilterChange(e.target.checked)}
						className="h-4 w-4 rounded border-gray-300"
					/>
					<label htmlFor="rightSideOnly" className="text-sm">
						Right side only
					</label>
				</div>
			</div>

			<div className="space-y-2">
				{pois.map((poi) => (
					<ServiceStationCard
						key={poi.id}
						station={poi}
						onClick={() => onPOIClick(poi.id)}
					/>
				))}
			</div>
		</div>
	);
}
