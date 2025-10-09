import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import type { Aktion } from "../../../shared/schema";

type AktionFormData = {
  name: string;
  startDatum: string;
  endDatum: string;
  ort: string;
  kassenverantwortlicher: string;
  iban: string;
  verpflegungstage: number;
  zuschusstage: number;
  status: "AKTIV" | "INAKTIV" | "ABGESCHLOSSEN";
};

export default function AktionManager() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<AktionFormData>({
    name: "",
    startDatum: "",
    endDatum: "",
    ort: "",
    kassenverantwortlicher: "",
    iban: "",
    verpflegungstage: 0,
    zuschusstage: 0,
    status: "AKTIV"
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isEditMode && id) {
      fetchAktion();
    }
  }, [id, isEditMode]);

  const fetchAktion = async () => {
    try {
      const response = await fetch(`/api/aktionen/${id}`, {
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Fehler beim Laden der Aktion");
      }

      const aktion: Aktion = await response.json();
      
      setFormData({
        name: aktion.name,
        startDatum: aktion.startDatum.split("T")[0],
        endDatum: aktion.endDatum.split("T")[0],
        ort: aktion.ort,
        kassenverantwortlicher: aktion.kassenverantwortlicher,
        iban: aktion.iban || "",
        verpflegungstage: aktion.verpflegungstage,
        zuschusstage: aktion.zuschusstage,
        status: aktion.status as "AKTIV" | "INAKTIV" | "ABGESCHLOSSEN"
      });
    } catch (error) {
      console.error("Fehler beim Laden:", error);
      alert("Fehler beim Laden der Aktion");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name ist erforderlich";
    }

    if (!formData.startDatum) {
      newErrors.startDatum = "Startdatum ist erforderlich";
    }

    if (!formData.endDatum) {
      newErrors.endDatum = "Enddatum ist erforderlich";
    }

    if (formData.startDatum && formData.endDatum) {
      const start = new Date(formData.startDatum);
      const end = new Date(formData.endDatum);
      if (end < start) {
        newErrors.endDatum = "Enddatum muss nach dem Startdatum liegen";
      }
    }

    if (!formData.ort.trim()) {
      newErrors.ort = "Ort ist erforderlich";
    }

    if (!formData.kassenverantwortlicher.trim()) {
      newErrors.kassenverantwortlicher = "Kassenverantwortliche:r ist erforderlich";
    }

    if (formData.iban && !isValidIBAN(formData.iban)) {
      newErrors.iban = "Ungültige IBAN";
    }

    if (formData.verpflegungstage < 0) {
      newErrors.verpflegungstage = "Verpflegungstage müssen >= 0 sein";
    }

    if (formData.zuschusstage < 0) {
      newErrors.zuschusstage = "Zuschusstage müssen >= 0 sein";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidIBAN = (iban: string): boolean => {
    // Einfache IBAN-Validierung (Format prüfen)
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
    const cleanIBAN = iban.replace(/\s/g, "");
    return ibanRegex.test(cleanIBAN) && cleanIBAN.length >= 15 && cleanIBAN.length <= 34;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const url = isEditMode ? `/api/aktionen/${id}` : "/api/aktionen";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          adminId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error("Fehler beim Speichern der Aktion");
      }

      alert(isEditMode ? "Aktion erfolgreich aktualisiert!" : "Aktion erfolgreich erstellt!");
      navigate("/admin");
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Fehler beim Speichern der Aktion");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (!confirm("Möchtest du diese Aktion wirklich löschen? Alle zugehörigen Abrechnungen werden ebenfalls gelöscht!")) {
      return;
    }

    try {
      const response = await fetch(`/api/aktionen/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Fehler beim Löschen der Aktion");
      }

      alert("Aktion erfolgreich gelöscht!");
      navigate("/admin");
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      alert("Fehler beim Löschen der Aktion");
    }
  };

  const handleInputChange = (field: keyof AktionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Fehler entfernen wenn Feld bearbeitet wird
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/admin")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Zurück zum Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? "Aktion bearbeiten" : "Neue Aktion erstellen"}
          </CardTitle>
          <CardDescription>
            {isEditMode 
              ? "Bearbeite die Details deiner Aktion" 
              : "Erstelle eine neue Aktion für Abrechnungen"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name der Aktion <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="z.B. Sommerlager 2025"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Datum */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDatum">
                  Startdatum <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDatum"
                  type="date"
                  value={formData.startDatum}
                  onChange={(e) => handleInputChange("startDatum", e.target.value)}
                  className={errors.startDatum ? "border-destructive" : ""}
                />
                {errors.startDatum && (
                  <p className="text-sm text-destructive">{errors.startDatum}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDatum">
                  Enddatum <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endDatum"
                  type="date"
                  value={formData.endDatum}
                  onChange={(e) => handleInputChange("endDatum", e.target.value)}
                  className={errors.endDatum ? "border-destructive" : ""}
                />
                {errors.endDatum && (
                  <p className="text-sm text-destructive">{errors.endDatum}</p>
                )}
              </div>
            </div>

            {/* Ort */}
            <div className="space-y-2">
              <Label htmlFor="ort">
                Ort <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ort"
                value={formData.ort}
                onChange={(e) => handleInputChange("ort", e.target.value)}
                placeholder="z.B. Stuttgart"
                className={errors.ort ? "border-destructive" : ""}
              />
              {errors.ort && (
                <p className="text-sm text-destructive">{errors.ort}</p>
              )}
            </div>

            {/* Kassenverantwortliche:r */}
            <div className="space-y-2">
              <Label htmlFor="kassenverantwortlicher">
                Kassenverantwortliche:r <span className="text-destructive">*</span>
              </Label>
              <Input
                id="kassenverantwortlicher"
                value={formData.kassenverantwortlicher}
                onChange={(e) => handleInputChange("kassenverantwortlicher", e.target.value)}
                placeholder="Vor- und Nachname"
                className={errors.kassenverantwortlicher ? "border-destructive" : ""}
              />
              {errors.kassenverantwortlicher && (
                <p className="text-sm text-destructive">{errors.kassenverantwortlicher}</p>
              )}
            </div>

            {/* IBAN */}
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN (optional)</Label>
              <Input
                id="iban"
                value={formData.iban}
                onChange={(e) => handleInputChange("iban", e.target.value)}
                placeholder="DE89 3704 0044 0532 0130 00"
                className={errors.iban ? "border-destructive" : ""}
              />
              {errors.iban && (
                <p className="text-sm text-destructive">{errors.iban}</p>
              )}
              <p className="text-sm text-muted-foreground">
                IBAN für eventuelle Rückerstattungen
              </p>
            </div>

            {/* Tage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="verpflegungstage">Verpflegungstage</Label>
                <Input
                  id="verpflegungstage"
                  type="number"
                  min="0"
                  value={formData.verpflegungstage}
                  onChange={(e) => handleInputChange("verpflegungstage", parseInt(e.target.value) || 0)}
                  className={errors.verpflegungstage ? "border-destructive" : ""}
                />
                {errors.verpflegungstage && (
                  <p className="text-sm text-destructive">{errors.verpflegungstage}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zuschusstage">Zuschusstage</Label>
                <Input
                  id="zuschusstage"
                  type="number"
                  min="0"
                  value={formData.zuschusstage}
                  onChange={(e) => handleInputChange("zuschusstage", parseInt(e.target.value) || 0)}
                  className={errors.zuschusstage ? "border-destructive" : ""}
                />
                {errors.zuschusstage && (
                  <p className="text-sm text-destructive">{errors.zuschusstage}</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AKTIV">Aktiv</SelectItem>
                  <SelectItem value="INAKTIV">Inaktiv</SelectItem>
                  <SelectItem value="ABGESCHLOSSEN">Abgeschlossen</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Aktiv: Abrechnungen können eingereicht werden
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-4">
              {isEditMode && (
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Löschen
                </Button>
              )}
              
              <div className="flex gap-2 ml-auto">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/admin")}
                >
                  Abbrechen
                </Button>
                
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Speichere..." : "Speichern"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
