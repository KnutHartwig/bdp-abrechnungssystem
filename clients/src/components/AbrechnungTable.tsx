import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Eye, 
  Trash2, 
  Download,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { Abrechnung } from "../../../shared/schema";

interface AbrechnungTableProps {
  abrechnungen: Abrechnung[];
  onUpdate?: () => void;
}

type SortField = "datum" | "kategorie" | "betrag" | "status";
type SortOrder = "asc" | "desc";

export default function AbrechnungTable({ abrechnungen, onUpdate }: AbrechnungTableProps) {
  const [sortField, setSortField] = useState<SortField>("datum");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 ml-1" />;
    }
    return sortOrder === "asc" 
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const sortedAbrechnungen = [...abrechnungen].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "datum":
        comparison = new Date(a.datum).getTime() - new Date(b.datum).getTime();
        break;
      case "kategorie":
        comparison = a.kategorie.localeCompare(b.kategorie);
        break;
      case "betrag":
        comparison = a.betrag - b.betrag;
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Möchtest du diese Abrechnung wirklich löschen?")) {
      return;
    }

    try {
      const response = await fetch(`/api/abrechnungen/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Fehler beim Löschen");
      }

      alert("Abrechnung erfolgreich gelöscht!");
      onUpdate?.();
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      alert("Fehler beim Löschen der Abrechnung");
    }
  };

  const handleDownload = async (id: number, filename: string) => {
    try {
      const response = await fetch(`/api/abrechnungen/${id}/beleg`, {
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Fehler beim Download");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Fehler beim Download:", error);
      alert("Fehler beim Download des Belegs");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE");
  };

  const formatKategorie = (kategorie: string) => {
    return kategorie.replace(/_/g, " ");
  };

  const getKategorieColor = (kategorie: string) => {
    const einnahmen = ["TEILNAHMEBEITRAEGE", "SONSTIGE_EINNAHMEN", "VORSCHUSS"];
    return einnahmen.includes(kategorie) ? "text-green-600" : "text-primary";
  };

  if (abrechnungen.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">Keine Abrechnungen vorhanden</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleSort("datum")}
                className="h-8 p-0 hover:bg-transparent"
              >
                Datum
                {getSortIcon("datum")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleSort("kategorie")}
                className="h-8 p-0 hover:bg-transparent"
              >
                Kategorie
                {getSortIcon("kategorie")}
              </Button>
            </TableHead>
            <TableHead>Beschreibung</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleSort("betrag")}
                className="h-8 p-0 hover:bg-transparent ml-auto"
              >
                Betrag
                {getSortIcon("betrag")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleSort("status")}
                className="h-8 p-0 hover:bg-transparent"
              >
                Status
                {getSortIcon("status")}
              </Button>
            </TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAbrechnungen.map((abrechnung) => (
            <TableRow key={abrechnung.id}>
              <TableCell className="font-medium">
                {formatDate(abrechnung.datum)}
              </TableCell>
              
              <TableCell>
                <Badge variant="outline" className={getKategorieColor(abrechnung.kategorie)}>
                  {formatKategorie(abrechnung.kategorie)}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="max-w-xs">
                  <p className="truncate">{abrechnung.beschreibung}</p>
                  {abrechnung.belegNummer && (
                    <p className="text-xs text-muted-foreground">
                      Beleg: {abrechnung.belegNummer}
                    </p>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  <p className="font-medium">{abrechnung.name}</p>
                  {abrechnung.stamm && (
                    <p className="text-xs text-muted-foreground">
                      {abrechnung.stamm}
                    </p>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="text-right font-semibold">
                {abrechnung.betrag.toFixed(2)} €
              </TableCell>
              
              <TableCell>
                <StatusBadge status={abrechnung.status} type="abrechnung" />
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {abrechnung.belegPfad && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(abrechnung.id, abrechnung.belegPfad!)}
                      title="Beleg herunterladen"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(`/abrechnung/${abrechnung.id}`, "_blank")}
                    title="Details anzeigen"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(abrechnung.id)}
                    title="Löschen"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
