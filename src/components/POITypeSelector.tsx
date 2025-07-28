import { type POIType, FUEL_TYPES, CONNECTION_TYPES } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { getChargingTypeIcon } from "@/lib/componentUtils";

interface POITypeSelectorProps {
  selectedTypes: Set<POIType>;
  onTypeChange: (types: Set<POIType>) => void;
  fuelType: string;
  connectionType: string;
  onFuelTypeChange: (value: string) => void;
  onConnectionTypeChange: (value: string) => void;
}

export function POITypeSelector({
  selectedTypes,
  onTypeChange,
  fuelType,
  connectionType,
  onFuelTypeChange,
  onConnectionTypeChange
}: POITypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="service_station" className="text-sm font-medium">
          Buscar por:
        </label>
        <div className="flex space-x-4">
          <POICheckbox
            id="service_station"
            label="Estaciones de servicio"
            checked={selectedTypes.has("service_station")}
            onChange={(checked) => {
              const newTypes = new Set(selectedTypes);
              if (checked) {
                newTypes.add("service_station");
              } else {
                newTypes.delete("service_station");
              }
              onTypeChange(newTypes);
            }}
          />
          <POICheckbox
            id="ev_charging_point"
            label="Estaciones de recarga"
            checked={selectedTypes.has("ev_charging_point")}
            onChange={(checked) => {
              const newTypes = new Set(selectedTypes);
              if (checked) {
                newTypes.add("ev_charging_point");
              } else {
                newTypes.delete("ev_charging_point");
              }
              onTypeChange(newTypes);
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {selectedTypes.has("service_station") && (
          <FuelTypeSelect value={fuelType} onChange={onFuelTypeChange} />
        )}
        {selectedTypes.has("ev_charging_point") && (
          <ConnectionTypeSelect
            value={connectionType}
            onChange={onConnectionTypeChange}
          />
        )}
      </div>
    </div>
  );
}

// Helper components
function POICheckbox({
  id,
  label,
  checked,
  onChange
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300"
      />
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
    </div>
  );
}

function FuelTypeSelect({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2 flex-1">
      <label htmlFor="fuel-type-select" className="text-sm font-medium">
        Combustible:
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="fuel-type-select" className="w-full">
          <SelectValue placeholder="Select fuel type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(FUEL_TYPES).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function ConnectionTypeSelect({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2 flex-1">
      <label htmlFor="connection-type-select" className="text-sm font-medium">
        Tipo de conexión:
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="connection-type-select" className="w-full">
          <SelectValue placeholder="Select connection type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(CONNECTION_TYPES).map(([key, value]) => (
              <SelectItem key={key} value={value}>
                {key}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
