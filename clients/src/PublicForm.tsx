import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import ActionSelect from "@/components/ActionSelect";
import CategorySelect from "@/components/CategorySelect";
import FileUpload from "@/components/FileUpload";
import Layout from "@/components/Layout";

// Zod Schema für Formular-Validierung
const abrechnungSchema = z.object({
  aktionId: z.number().min(1, "Bitte wähle eine Aktion aus"),
  kategorie: z.string().min(1, "Bitte wähle eine Kategorie aus"),
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  stammGruppe: z.string().min(2, "Stamm/Gruppe muss mindestens 2 Zeichen lang sein"),
  datum: z.string().min(1, "Datum ist erforderlich"),
  beschreibung: z.string().min(5, "Beschreibung muss mindestens 5 Zeichen lang sein"),
  betrag: z.number().min(0.01, "Betrag muss größer als 0 sein"),
  zuordnung: z.string().optional(),
});

type AbrechnungFormData = z.infer<typeof abrechnungSchema>;

export default function PublicForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AbrechnungFormData>({
    resolver: zodResolver(abrechnungSchema),
    defaultValues: {
      aktionId: 0,
      kategorie: "",
      name: "",
      stammGruppe: "",
      datum: new Date().toISOString().split("T")[0],
      beschreibung: "",
      betrag: 0,
      zuordnung: "",
    },
  });

  const selectedKategorie = watch("kategorie");

  // Aktionen laden
  const { data: aktionen, isLoading: aktionenLoading } = useQuery({
    queryKey: ["aktionen-public"],
    queryFn: async () => {
      const res = await fetch("/api/aktionen/active");
      if (!res.ok) throw new Error("Fehler beim Laden der Aktionen");
      return res.json();
    },
  });

  // Abrechnung einreichen
  const submitMutation = useMutation({
    mutationFn: async (data: AbrechnungFormData) => {
      const formData = new FormData();
      
      // Daten hinzufügen
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Dateien hinzufügen
      files.forEach((file) => {
        formData.append("belege", file);
      });

      const res = await fetch("/api/abrechnungen", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Fehler beim Einreichen der Abrechnung");
      }

      return res.json();
    },
    onSuccess: () => {
      setSubmitStatus("success");
      setErrorMessage("");
      reset();
      setFiles([]);
      
      // Erfolgs-Alert nach 5 Sekunden zurücksetzen
      setTimeout(() => setSubmitStatus("idle"), 5000);
    },
    onError: (error: Error) => {
      setSubmitStatus("error");
      setErrorMessage(error.message);
    },
  });

  const onSubmit = (data: AbrechnungFormData) => {
    if (files.length === 0) {
      setSubmitStatus("error");
      setErrorMessage("Bitte lade mindestens einen Beleg hoch");
      return;
    }
    submitMutation.mutate(data);
  };

  // Kategorie-spezifische Felder anzeigen
  const showZuordnung = [
    "FAHRTKOSTEN",
    "UNTERKUNFT",
    "MATERIAL",
    "PORTO",
    "TELEKOMMUNIKATION",
    "SONSTIGE_AUSGABEN",
  ].includes(selectedKategorie);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-3xl font-bold">
                Abrechnung einreichen
              </CardTitle>
              <CardDescription className="text-blue-100">
                BdP Landesverband Baden-Württemberg e.V.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Erfolgs-/Fehler-Meldungen */}
              {submitStatus === "success" && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 ml-2">
                    <strong>Erfolgreich eingereicht!</strong> Deine Abrechnung wurde an die Landeskasse gesendet.
                  </AlertDescription>
                </Alert>
              )}

              {submitStatus === "error" && (
                <Alert className="mb-6 bg-red-50 border-red-200">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-red-800 ml-2">
                    <strong>Fehler:</strong> {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Aktion auswählen */}
                <div>
                  <Label htmlFor="aktionId" className="text-lg font-semibold">
                    Aktion auswählen *
                  </Label>
                  <ActionSelect
                    aktionen={aktionen || []}
                    isLoading={aktionenLoading}
                    value={watch("aktionId")}
                    onChange={(value) => setValue("aktionId", value)}
                  />
                  {errors.aktionId && (
                    <p className="text-red-500 text-sm mt-1">{errors.aktionId.message}</p>
                  )}
                </div>

                {/* Kategorie auswählen */}
                <div>
                  <Label htmlFor="kategorie" className="text-lg font-semibold">
                    Kategorie *
                  </Label>
                  <CategorySelect
                    value={watch("kategorie")}
                    onChange={(value) => setValue("kategorie", value)}
                  />
                  {errors.kategorie && (
                    <p className="text-red-500 text-sm mt-1">{errors.kategorie.message}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="name">Name (Vor- und Nachname) *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="z.B. Max Mustermann"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Stamm/Gruppe */}
                <div>
                  <Label htmlFor="stammGruppe">Stamm/Gruppe *</Label>
                  <Input
                    id="stammGruppe"
                    type="text"
                    placeholder="z.B. Stamm Adler oder Landesleitung"
                    {...register("stammGruppe")}
                    className={errors.stammGruppe ? "border-red-500" : ""}
                  />
                  {errors.stammGruppe && (
                    <p className="text-red-500 text-sm mt-1">{errors.stammGruppe.message}</p>
                  )}
                </div>

                {/* Datum */}
                <div>
                  <Label htmlFor="datum">Datum *</Label>
                  <Input
                    id="datum"
                    type="date"
                    {...register("datum")}
                    className={errors.datum ? "border-red-500" : ""}
                  />
                  {errors.datum && (
                    <p className="text-red-500 text-sm mt-1">{errors.datum.message}</p>
                  )}
                </div>

                {/* Beschreibung */}
                <div>
                  <Label htmlFor="beschreibung">Beschreibung/Beleg *</Label>
                  <Textarea
                    id="beschreibung"
                    placeholder="z.B. Lebensmittel Aldi, Fahrt nach Stuttgart, etc."
                    rows={4}
                    {...register("beschreibung")}
                    className={errors.beschreibung ? "border-red-500" : ""}
                  />
                  {errors.beschreibung && (
                    <p className="text-red-500 text-sm mt-1">{errors.beschreibung.message}</p>
                  )}
                </div>

                {/* Zuordnung (nur bei bestimmten Kategorien) */}
                {showZuordnung && (
                  <div>
                    <Label htmlFor="zuordnung">Zuordnung (optional)</Label>
                    <Input
                      id="zuordnung"
                      type="text"
                      placeholder="z.B. Maßnahme oder Verwaltung"
                      {...register("zuordnung")}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Bei Belegen die Zuordnung zu Maßnahme oder Verwaltung angeben
                    </p>
                  </div>
                )}

                {/* Betrag */}
                <div>
                  <Label htmlFor="betrag">Betrag (€) *</Label>
                  <Input
                    id="betrag"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("betrag", { valueAsNumber: true })}
                    className={errors.betrag ? "border-red-500" : ""}
                  />
                  {errors.betrag && (
                    <p className="text-red-500 text-sm mt-1">{errors.betrag.message}</p>
                  )}
                </div>

                {/* Datei-Upload */}
                <div>
                  <Label className="text-lg font-semibold">Belege hochladen *</Label>
                  <FileUpload files={files} onChange={setFiles} />
                  <p className="text-sm text-gray-500 mt-2">
                    Bitte lade Fotos oder PDFs deiner Belege hoch (max. 10 MB pro Datei)
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full py-6 text-lg font-semibold"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Wird eingereicht...
                      </>
                    ) : (
                      "Abrechnung einreichen"
                    )}
                  </Button>
                </div>

                <p className="text-sm text-gray-500 text-center pt-2">
                  * Pflichtfelder
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Hinweis-Box */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-900 mb-2">Hinweise:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Alle Felder mit * sind Pflichtfelder</li>
                <li>Bitte lade immer den Original-Beleg als Foto oder PDF hoch</li>
                <li>Die Abrechnung wird automatisch an die Landeskasse weitergeleitet</li>
                <li>Bei Fragen wende dich an: kasse@bdp-bawue.de</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
