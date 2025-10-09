import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Edit, 
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  FileText
} from "lucide-react";
import AbrechnungTable from "../components/AbrechnungTable";
import SummenCard from "../components/SummenCard";
import FilterPanel from "../components/FilterPanel";
import StatusBadge from "../components/StatusBadge";
import type { Aktion, Abrechnung } from "../../../shared/schema";

interface Summen {
  einnahmen: number;
  ausgaben: number;
  saldo: number;
  kategorien: {
    [key: string]: number;
  };
}

export default function AktionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aktion, setAktion] = useState<Aktion | null>(null);
  const [abrechnungen, setAbrechnungen] = useState<Abrechnung[]>([]);
  const [filteredAbrechnungen, setFilteredAbrechnungen] = useState<Abrechnung[]>([]);
  const [summen, setSummen] = useState<Summen>({
    einnahmen: 0,
    ausgaben: 0,
    saldo: 0,
    kategorien: {}
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("uebersicht");

  useEffect(() => {
    if (id) {
      fetchAktionDetails();
    }
  }, [id]);

  useEffect(() => {
    calculateSummen(filteredAbrechnungen);
  }, [filteredAbrechnungen]);

  const fetchAktionDetails = async () => {
    try {
      setLoading(true);

      // Aktion laden
      const aktionResponse = await fetch(`/api/aktionen/${id}`, {
        credentials: "include"
      });

      if (!aktionResponse.ok) {
        throw new Error("Fehler beim Laden der Aktion");
      }

      const aktionData = await aktionResponse.json();
      setAktion(aktionData);

      // Abrechnungen laden
      const abrechnungenResponse = await fetch(`/api/abrechnungen?aktionId=${id}`, {
        credentials: "include"
      });

      if (!abrechnungenResponse.ok) {
        throw new Error("Fehler beim Laden der Abrechnungen");
      }

      const abrechnungenData = await abrechnungenResponse.json();
      setAbrechnungen(abrechnungenData);
      setFilteredAbrechnungen(abrechnungenData);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummen = (data: Abrechnung[]) => {
    const newSummen: Summen = {
      einnahmen: 0,
      ausgaben: 0,
      saldo: 0,
      kategorien: {}
    };

    data.forEach((abr) => {
      const betrag = abr.betrag;
      
      // Einnahmen-Kategorien
      if (["TEILNAHMEBEITRAEGE", "SONSTIGE_EINNAHMEN", "VORSCHUSS"].includes(abr.kategorie)) {
        newSummen.einnahmen += betrag;
      } else {
        // Ausgaben-Kategorien
        newSummen.ausgaben += betrag;
      }

      // Nach Kategorie
      if (!newSummen.kategorien[abr.kategorie]) {
        newSummen.kategorien[abr.kategorie] = 0;
      }
      newSummen.kategorien[abr.kategorie] += betrag;
    });

    newSummen.saldo = newSummen.einnahmen - newSummen.ausgaben;
    setSummen(newSummen);
  };

  const handleFilterChange = (filtered: Abrechnung[]) => {
    setFilteredAbrechnungen(filtered);
  };

  const handleExportPDF = async () => {
    if (!aktion) return;

    try {
      const response = await fetch(`/api/aktionen/${aktion.id}/export-pdf`, {
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen des PDFs");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Abrechnung_${aktion.name}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Fehler beim PDF-Export:", error);
      alert("Fehler beim Erstellen des PDFs");
    }
  };

  const handleSendEmail = async () => {
    if (!aktion) return;

    if (!confirm("Möchtest du die Abrechnung wirklich an kasse@bdp-bawue.de senden?")) {
      return;
    }

    try {
      const response = await fetch(`/api/aktionen/${aktion.id}/send-email`, {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Fehler beim Versenden der E-Mail");
      }

      alert("E-Mail erfolgreich versendet!");
      fetchAktionDetails(); // Aktualisiere Status
    } catch (error) {
      console.error("Fehler beim E-Mail-Versand:", error);
      alert("Fehler beim Versenden der E-Mail");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Aktionsdetails...</p>
        </div>
      </div>
    );
  }

  if (!aktion) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Aktion nicht gefunden</h3>
            <p className="text-muted-foreground mb-4">
              Die angeforderte Aktion existiert nicht oder du hast keine Berechtigung.
            </p>
            <Button onClick={() => navigate("/admin")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/admin")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{aktion.name}</h1>
              <StatusBadge status={aktion.status} />
            </div>
            
            <div className="grid gap-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(aktion.startDatum)} - {formatDate(aktion.endDatum)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{aktion.ort}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Kassenverantwortlich: {aktion.kassenverantwortlicher}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/admin/aktionen/${aktion.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Bearbeiten
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
            >
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            
            <Button onClick={handleSendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              An Kasse senden
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="uebersicht">Übersicht</TabsTrigger>
          <TabsTrigger value="abrechnungen">
            Abrechnungen ({abrechnungen.length})
          </TabsTrigger>
          <TabsTrigger value="statistik">Statistik</TabsTrigger>
        </TabsList>

        {/* Übersicht Tab */}
        <TabsContent value="uebersicht" className="space-y-6">
          <SummenCard summen={summen} />

          <Card>
            <CardHeader>
              <CardTitle>Letzte Abrechnungen</CardTitle>
              <CardDescription>
                Die 5 neuesten Abrechnungen dieser Aktion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AbrechnungTable 
                abrechnungen={abrechnungen.slice(0, 5)}
                onUpdate={fetchAktionDetails}
              />
              
              {abrechnungen.length > 5 && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("abrechnungen")}
                  >
                    Alle {abrechnungen.length} Abrechnungen anzeigen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Abrechnungen Tab */}
        <TabsContent value="abrechnungen" className="space-y-6">
          <FilterPanel 
            abrechnungen={abrechnungen}
            onFilterChange={handleFilterChange}
          />

          <Card>
            <CardHeader>
              <CardTitle>
                Alle Abrechnungen ({filteredAbrechnungen.length})
              </CardTitle>
              <CardDescription>
                Verwaltung aller Belege und Abrechnungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AbrechnungTable 
                abrechnungen={filteredAbrechnungen}
                onUpdate={fetchAktionDetails}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistik Tab */}
        <TabsContent value="statistik" className="space-y-6">
          <SummenCard summen={summen} />

          <Card>
            <CardHeader>
              <CardTitle>Verteilung nach Kategorien</CardTitle>
              <CardDescription>
                Übersicht der Beträge pro Kategorie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(summen.kategorien).map(([kategorie, betrag]) => {
                  const isEinnahme = ["TEILNAHMEBEITRAEGE", "SONSTIGE_EINNAHMEN", "VORSCHUSS"].includes(kategorie);
                  const prozent = summen.ausgaben > 0 
                    ? (betrag / (isEinnahme ? summen.einnahmen : summen.ausgaben)) * 100 
                    : 0;

                  return (
                    <div key={kategorie}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {kategorie.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-bold">
                          {betrag.toFixed(2)} €
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isEinnahme ? "bg-green-500" : "bg-primary"}`}
                          style={{ width: `${prozent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
