import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  Plus, 
  FileText, 
  Calendar, 
  Users, 
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import type { Aktion } from "../../../shared/schema";

interface AktionStats {
  total: number;
  aktiv: number;
  abgeschlossen: number;
  inaktiv: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [aktionen, setAktionen] = useState<Aktion[]>([]);
  const [stats, setStats] = useState<AktionStats>({
    total: 0,
    aktiv: 0,
    abgeschlossen: 0,
    inaktiv: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAktionen();
  }, []);

  const fetchAktionen = async () => {
    try {
      const response = await fetch("/api/aktionen", {
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Fehler beim Laden der Aktionen");
      }

      const data = await response.json();
      setAktionen(data);

      // Berechne Statistiken
      const newStats = data.reduce((acc: AktionStats, aktion: Aktion) => {
        acc.total++;
        if (aktion.status === "AKTIV") acc.aktiv++;
        if (aktion.status === "ABGESCHLOSSEN") acc.abgeschlossen++;
        if (aktion.status === "INAKTIV") acc.inaktiv++;
        return acc;
      }, { total: 0, aktiv: 0, abgeschlossen: 0, inaktiv: 0 });

      setStats(newStats);
    } catch (error) {
      console.error("Fehler beim Laden der Aktionen:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      AKTIV: "default",
      ABGESCHLOSSEN: "secondary",
      INAKTIV: "outline"
    } as const;

    const labels = {
      AKTIV: "Aktiv",
      ABGESCHLOSSEN: "Abgeschlossen",
      INAKTIV: "Inaktiv"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Aktionen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Willkommen zurück, {user?.username}
          </p>
        </div>
        <Button 
          onClick={() => navigate("/admin/aktionen")}
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Neue Aktion
        </Button>
      </div>

      {/* Statistik-Karten */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gesamt
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Alle Aktionen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktiv
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.aktiv}</div>
            <p className="text-xs text-muted-foreground">
              Laufende Aktionen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Abgeschlossen
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.abgeschlossen}</div>
            <p className="text-xs text-muted-foreground">
              Fertige Aktionen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inaktiv
            </CardTitle>
            <XCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inaktiv}</div>
            <p className="text-xs text-muted-foreground">
              Pausierte Aktionen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Aktionen-Liste */}
      <Card>
        <CardHeader>
          <CardTitle>Meine Aktionen</CardTitle>
          <CardDescription>
            Verwalte deine Aktionen und ihre Abrechnungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aktionen.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Keine Aktionen</h3>
              <p className="text-muted-foreground mb-4">
                Du hast noch keine Aktionen erstellt.
              </p>
              <Button onClick={() => navigate("/admin/aktionen")}>
                <Plus className="mr-2 h-4 w-4" />
                Erste Aktion erstellen
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {aktionen.map((aktion) => (
                <Card 
                  key={aktion.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/admin/aktionen/${aktion.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{aktion.name}</h3>
                          {getStatusBadge(aktion.status)}
                        </div>
                        
                        <div className="grid gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(aktion.startDatum)} - {formatDate(aktion.endDatum)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              Kassenverantwortlich: {aktion.kassenverantwortlicher}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm">
                        Details →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
