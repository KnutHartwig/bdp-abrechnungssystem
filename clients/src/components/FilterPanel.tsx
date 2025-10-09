import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Search, X } from "lucide-react";
import type { Abrechnung } from "../../../shared/schema";

interface FilterPanelProps {
  abrechnungen: Abrechnung[];
  onFilterChange: (filtered: Abrechnung[]) => void;
}

const KATEGORIEN = [
  { value: "TEILNAHMEBEITRAEGE", label: "Teilnahmebeiträge" },
  { value: "SONSTIGE_EINNAHMEN", label: "Sonstige Einnahmen" },
  { value: "VORSCHUSS", label: "Vorschuss" },
  { value: "FAHRTKOSTEN", label: "Fahrtkosten" },
  { value: "UNTERKUNFT", label: "Unterkunft" },
  { value: "VERPFLEGUNG", label: "Verpflegung" },
  { value: "MATERIAL", label: "Material" },
  { value: "PORTO", label: "Porto" },
  { value: "TELEKOMMUNIKATION", label: "Telekommunikation" },
  { value: "SONSTIGE_AUSGABEN", label: "Sonstige Ausgaben" },
  { value: "OFFENE_VERBINDLICHKEITEN", label: "Offene Verbindlichkeiten" }
];

const STATUS_OPTIONS = [
  { value: "ENTWURF", label: "Entwurf" },
  { value: "EINGEREICHT", label: "Eingereicht" },
  { value: "VERSENDET", label: "Versendet" }
];

export default function FilterPanel({ abrechnungen, onFilterChange }: FilterPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategorie, setSelectedKategorie] = useState<string>("alle");
  const [selectedStatus, setSelectedStatus] = useState<string>("alle");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedKategorie, selectedStatus, dateFrom, dateTo, abrechnungen]);

  const applyFilters = () => {
    let filtered = [...abrechnungen];

    // Suchbegriff
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (abr) =>
          abr.name.toLowerCase().includes(term) ||
          abr.beschreibung.toLowerCase().includes(term) ||
          abr.stamm?.toLowerCase().includes(term) ||
          abr.belegNummer?.toLowerCase().includes(term)
      );
    }

    // Kategorie
    if (selectedKategorie !== "alle") {
      filtered = filtered.filter((abr) => abr.kategorie === selectedKategorie);
    }

    // Status
    if (selectedStatus !== "alle") {
      filtered = filtered.filter((abr) => abr.status === selectedStatus);
    }

    // Datum von
    if (dateFrom) {
      filtered = filtered.filter((abr) => {
        const abrDate = new Date(abr.datum);
        const fromDate = new Date(dateFrom);
        return abrDate >= fromDate;
      });
    }

    // Datum bis
    if (dateTo) {
      filtered = filtered.filter((abr) => {
        const abrDate = new Date(abr.datum);
        const toDate = new Date(dateTo);
        return abrDate <= toDate;
      });
    }

    onFilterChange(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedKategorie("alle");
    setSelectedStatus("alle");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = 
    searchTerm !== "" ||
    selectedKategorie !== "alle" ||
    selectedStatus !== "alle" ||
    dateFrom !== "" ||
    dateTo !== "";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Suchfeld */}
          <div className="space-y-2">
            <Label htmlFor="search">Suche</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Name, Beschreibung, Stamm, Beleg-Nr..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filter-Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Kategorie */}
            <div className="space-y-2">
              <Label htmlFor="kategorie">Kategorie</Label>
              <Select value={selectedKategorie} onValueChange={setSelectedKategorie}>
                <SelectTrigger id="kategorie">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle Kategorien</SelectItem>
                  {KATEGORIEN.map((kat) => (
                    <SelectItem key={kat.value} value={kat.value}>
                      {kat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle Status</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Datum von */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Von Datum</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            {/* Datum bis */}
            <div className="space-y-2">
              <Label htmlFor="dateTo">Bis Datum</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                Filter zurücksetzen
              </Button>
            </div>
          )}

          {/* Ergebnis-Anzeige */}
          <div className="text-sm text-muted-foreground">
            {abrechnungen.length === 0 ? (
              "Keine Abrechnungen gefunden"
            ) : (
              <>
                {hasActiveFilters ? (
                  <>
                    <span className="font-medium">{abrechnungen.length}</span> von{" "}
                    <span className="font-medium">{abrechnungen.length}</span> Abrechnungen angezeigt
                  </>
                ) : (
                  <>
                    <span className="font-medium">{abrechnungen.length}</span> Abrechnungen gesamt
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
