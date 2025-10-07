"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Calculator, CheckCircle2, Loader2 } from "lucide-react";
import { 
  calculateFahrtkosten, 
  kategorieLabels, 
  fahrzeugtypLabels, 
  zuschlaegeLabels 
} from "@/lib/utils";

interface Aktion {
  id: string;
  titel: string;
  startdatum: string;
  enddatum: string;
  status: string;
}

export default function AbrechnungPage() {
  const [aktionen, setAktionen] = useState<Aktion[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    stammGruppe: "",
    email: "",
    aktionId: "",
    kategorie: "",
    betrag: "",
    beschreibung: "",
    belegdatum: "",
    belegUrl: "",
    // Fahrtkosten-spezifische Felder
    fahrzeugtyp: "",
    anzahlMitfahrer: "",
    kilometerstand: "",
    zuschlaege: [] as string[],
  });

  const [berechneterBetrag, setBerechneterBetrag] = useState<number | null>(null);

  useEffect(() => {
    fetchAktionen();
  }, []);

  const fetchAktionen = async () => {
    try {
      const res = await fetch("/api/aktionen?status=AKTIV");
      const data = await res.json();
      setAktionen(data);
    } catch (error) {
      console.error("Fehler beim Laden der Aktionen:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setFormData((prev) => ({ ...prev, belegUrl: data.url }));
    } catch (error) {
      alert("Fehler beim Hochladen der Datei");
    } finally {
      setUploading(false);
    }
  };

  const calculateFahrtkostenBetrag = () => {
    if (
      formData.kategorie === "FAHRTKOSTEN" &&
      formData.fahrzeugtyp &&
      formData.kilometerstand
    ) {
      const betrag = calculateFahrtkosten(
        parseFloat(formData.kilometerstand),
        formData.fahrzeugtyp,
        parseInt(formData.anzahlMitfahrer) || 0,
        formData.zuschlaege
      );
      setBerechneterBetrag(betrag);
      setFormData((prev) => ({ ...prev, betrag: betrag.toString() }));
    }
  };

  useEffect(() => {
    if (formData.kategorie === "FAHRTKOSTEN") {
      calculateFahrtkostenBetrag();
    } else {
      setBerechneterBetrag(null);
    }
  }, [
    formData.fahrzeugtyp,
    formData.kilometerstand,
    formData.anzahlMitfahrer,
    formData.zuschlaege,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/abrechnungen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Fehler beim Absenden");

      setSuccess(true);
      setFormData({
        name: "",
        stammGruppe: "",
        email: "",
        aktionId: "",
        kategorie: "",
        betrag: "",
        beschreibung: "",
        belegdatum: "",
        belegUrl: "",
        fahrzeugtyp: "",
        anzahlMitfahrer: "",
        kilometerstand: "",
        zuschlaege: [],
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      alert("Fehler beim Absenden der Abrechnung");
    } finally {
      setLoading(false);
    }
  };

  const toggleZuschlag = (zuschlag: string) => {
    setFormData((prev) => ({
      ...prev,
      zuschlaege: prev.zuschlaege.includes(zuschlag)
        ? prev.zuschlaege.filter((z) => z !== zuschlag)
        : [...prev.zuschlaege, zuschlag],
    }));
  };

  const isFahrtkosten = formData.kategorie === "FAHRTKOSTEN";

  return (
    <div className="min-h-screen bg-gradient-to-br from-bdp-blue/5 via-white to-bdp-yellow/5">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-bdp-blue hover:text-bdp-blue-light">
            <ArrowLeft className="h-5 w-5" />
            Zurück zur Startseite
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {success && (
          <Card className="mb-8 border-l-4 border-l-bdp-green bg-bdp-green/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-bdp-green" />
                <div>
                  <p className="font-semibold text-bdp-green">Erfolgreich eingereicht!</p>
                  <p className="text-sm text-muted-foreground">
                    Ihre Abrechnung wurde erfolgreich gespeichert.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl">Abrechnung einreichen</CardTitle>
            <CardDescription>
              Füllen Sie das Formular aus, um Ihre Abrechnung einzureichen. Alle Felder mit * sind
              Pflichtfelder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Persönliche Daten</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Vollständiger Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stammGruppe">Stamm/Gruppe *</Label>
                    <Input
                      id="stammGruppe"
                      value={formData.stammGruppe}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, stammGruppe: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail-Adresse *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Aktion & Kategorie */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Aktion & Kategorie</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="aktion">Aktion *</Label>
                    <select
                      id="aktion"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.aktionId}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, aktionId: e.target.value }))
                      }
                      required
                    >
                      <option value="">Bitte wählen...</option>
                      {aktionen.map((aktion) => (
                        <option key={aktion.id} value={aktion.id}>
                          {aktion.titel}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kategorie">Kategorie *</Label>
                    <select
                      id="kategorie"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.kategorie}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          kategorie: e.target.value,
                          // Reset Fahrtkosten-Felder
                          fahrzeugtyp: "",
                          anzahlMitfahrer: "",
                          kilometerstand: "",
                          zuschlaege: [],
                        }))
                      }
                      required
                    >
                      <option value="">Bitte wählen...</option>
                      {Object.entries(kategorieLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Fahrtkosten-spezifische Felder */}
              {isFahrtkosten && (
                <div className="space-y-4 rounded-lg border-2 border-bdp-yellow/30 bg-bdp-yellow/5 p-4">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-bdp-yellow" />
                    <h3 className="text-lg font-semibold">Fahrtkosten-Berechnung</h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fahrzeugtyp">Fahrzeugtyp *</Label>
                      <select
                        id="fahrzeugtyp"
                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.fahrzeugtyp}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, fahrzeugtyp: e.target.value }))
                        }
                        required
                      >
                        <option value="">Bitte wählen...</option>
                        {Object.entries(fahrzeugtypLabels).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kilometerstand">Gefahrene Kilometer *</Label>
                      <Input
                        id="kilometerstand"
                        type="number"
                        step="0.1"
                        value={formData.kilometerstand}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, kilometerstand: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anzahlMitfahrer">Anzahl Mitfahrer (optional)</Label>
                    <Input
                      id="anzahlMitfahrer"
                      type="number"
                      min="0"
                      value={formData.anzahlMitfahrer}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, anzahlMitfahrer: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Zuschläge (optional)</Label>
                    <div className="space-y-2">
                      {Object.entries(zuschlaegeLabels).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.zuschlaege.includes(key)}
                            onChange={() => toggleZuschlag(key)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {berechneterBetrag !== null && (
                    <div className="rounded-md bg-bdp-green/10 p-4">
                      <p className="text-sm text-muted-foreground">Berechneter Betrag:</p>
                      <p className="text-2xl font-bold text-bdp-green">
                        {berechneterBetrag.toFixed(2)} €
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Beleg Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Beleg-Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="belegdatum">Belegdatum *</Label>
                    <Input
                      id="belegdatum"
                      type="date"
                      value={formData.belegdatum}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, belegdatum: e.target.value }))
                      }
                      required
                    />
                  </div>
                  {!isFahrtkosten && (
                    <div className="space-y-2">
                      <Label htmlFor="betrag">Betrag in EUR *</Label>
                      <Input
                        id="betrag"
                        type="number"
                        step="0.01"
                        value={formData.betrag}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, betrag: e.target.value }))
                        }
                        required
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beschreibung">Beschreibung (optional)</Label>
                  <Input
                    id="beschreibung"
                    value={formData.beschreibung}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, beschreibung: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="beleg">Beleg hochladen (optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="beleg"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  {uploading && <Loader2 className="h-5 w-5 animate-spin text-bdp-blue" />}
                  {formData.belegUrl && (
                    <CheckCircle2 className="h-5 w-5 text-bdp-green" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Erlaubte Formate: PDF, JPG, PNG (max. 5MB)
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Wird eingereicht...
                    </>
                  ) : (
                    "Abrechnung einreichen"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Bei Fragen kontaktieren Sie uns unter:{" "}
            <a href="mailto:kasse@bdp-bawue.de" className="text-bdp-blue hover:underline">
              kasse@bdp-bawue.de
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
