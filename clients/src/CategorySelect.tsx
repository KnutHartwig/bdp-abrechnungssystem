import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

const KATEGORIEN = [
  { value: "TEILNAHMEBEITRAEGE", label: "Teilnahmebeiträge", icon: "👥" },
  { value: "SONSTIGE_EINNAHMEN", label: "Sonstige Einnahmen", icon: "💰" },
  { value: "VORSCHUSS", label: "Vorschuss", icon: "📤" },
  { value: "FAHRTKOSTEN", label: "Fahrtkosten", icon: "🚗" },
  { value: "UNTERKUNFT", label: "Unterkunft", icon: "🏠" },
  { value: "VERPFLEGUNG", label: "Verpflegung", icon: "🍽️" },
  { value: "MATERIAL", label: "Material", icon: "📦" },
  { value: "PORTO", label: "Porto", icon: "📮" },
  { value: "TELEKOMMUNIKATION", label: "Telekommunikation", icon: "📱" },
  { value: "SONSTIGE_AUSGABEN", label: "Sonstige Ausgaben", icon: "💳" },
  { value: "OFFENE_VERBINDLICHKEITEN", label: "Offene Verbindlichkeiten", icon: "📋" },
];

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CategorySelect({ value, onChange }: CategorySelectProps) {
  // Kategorien nach Einnahmen und Ausgaben gruppieren
  const einnahmen = KATEGORIEN.slice(0, 3);
  const ausgaben = KATEGORIEN.slice(3);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Bitte wähle eine Kategorie aus" />
      </SelectTrigger>
      <SelectContent>
        {/* Einnahmen */}
        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Einnahmen
        </div>
        {einnahmen.map((kat) => (
          <SelectItem key={kat.value} value={kat.value}>
            <span className="mr-2">{kat.icon}</span>
            {kat.label}
          </SelectItem>
        ))}

        {/* Trennlinie */}
        <div className="my-1 border-t" />

        {/* Ausgaben */}
        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Ausgaben
        </div>
        {ausgaben.map((kat) => (
          <SelectItem key={kat.value} value={kat.value}>
            <span className="mr-2">{kat.icon}</span>
            {kat.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
