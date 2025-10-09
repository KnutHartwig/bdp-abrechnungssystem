import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Loader2 } from "lucide-react";

interface Aktion {
  id: number;
  name: string;
  zeitraum: string;
  status: string;
}

interface ActionSelectProps {
  aktionen: Aktion[];
  isLoading: boolean;
  value: number;
  onChange: (value: number) => void;
}

export default function ActionSelect({ aktionen, isLoading, value, onChange }: ActionSelectProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
        <span className="text-gray-600">Aktionen werden geladen...</span>
      </div>
    );
  }

  if (!aktionen || aktionen.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">
          <strong>Keine aktiven Aktionen gefunden.</strong>
          <br />
          Bitte kontaktiere die Verwaltung, um eine Aktion anzulegen.
        </p>
      </div>
    );
  }

  return (
    <Select
      value={value.toString()}
      onValueChange={(val) => onChange(parseInt(val))}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Bitte wähle eine Aktion aus" />
      </SelectTrigger>
      <SelectContent>
        {aktionen.map((aktion) => (
          <SelectItem key={aktion.id} value={aktion.id.toString()}>
            <div className="flex flex-col">
              <span className="font-medium">{aktion.name}</span>
              <span className="text-xs text-gray-500">{aktion.zeitraum}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
