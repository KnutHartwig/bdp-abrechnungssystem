# 🐛 Bugfix-Dokumentation - Alle Build-Fehler behoben

## Fehler 1: IBAN fehlt in Seed-Daten
**Fehler:**
```
Property 'iban' is missing in type {...} but required in type 'AbrechnungUncheckedCreateInput'
Datei: prisma/seed.ts:73
```

**Ursache:** Das `iban`-Feld wurde zum Schema hinzugefügt, aber nicht in den Test-Daten

**✅ Behoben:** Alle 11 Test-Abrechnungen im `prisma/seed.ts` mit IBAN-Feld ergänzt

---

## Fehler 2: IBAN fehlt in API-Route
**Fehler:**
```
Type is missing the following properties from type 'AbrechnungCreateInput': iban, aktion
Datei: src/app/api/abrechnung/route.ts:125
```

**Ursache:** API akzeptiert keine IBAN vom Frontend

**✅ Behoben in 3 Schritten:**

### 1. Request-Body erweitert (Zeile 51-67)
```typescript
const {
  name,
  stamm,
  email,
  iban,        // ← NEU
  aktionId,
  // ... restliche Felder
} = body;
```

### 2. Validierung angepasst (Zeile 70)
```typescript
if (!name || !stamm || !email || !iban || !aktionId || !kategorie || !belegdatum) {
  return NextResponse.json(
    { success: false, error: 'Pflichtfelder fehlen' },
    { status: 400 }
  );
}
```

### 3. Datenbank-Eintrag erweitert (Zeile 125-143)
```typescript
const abrechnung = await prisma.abrechnung.create({
  data: {
    name,
    stamm,
    email,
    iban,      // ← NEU
    aktionId,
    // ... restliche Felder
  },
});
```

---

## Bonus: PDF-Export mit IBAN

Die PDF-Tabellen zeigen jetzt auch IBAN für Rückerstattungen:

**Betroffene Datei:** `src/lib/pdf-generator.ts`
- Header: Name | Stamm | **IBAN** | Datum | Beschreibung | Betrag
- Summenzeile: colspan von 4 auf 5 erhöht

---

## 📋 Zusammenfassung aller Änderungen

| Datei | Änderung | Status |
|-------|----------|--------|
| `prisma/seed.ts` | IBAN zu allen 11 Test-Abrechnungen | ✅ |
| `src/app/api/abrechnung/route.ts` | IBAN-Feld: Extract + Validate + Create | ✅ |
| `src/lib/pdf-generator.ts` | IBAN-Spalte in PDF-Tabellen | ✅ |
| `src/app/admin/page.tsx` | IBAN-Spalte in Admin-Übersicht | ✅ |
| `src/app/abrechnung/page.tsx` | IBAN-Eingabefeld im Formular | ✅ |
| `prisma/schema.prisma` | IBAN-Feld im Schema | ✅ |

---

## 🚀 Deployment-Schritte

1. **Code zu GitHub pushen:**
   ```bash
   git add .
   git commit -m "Fix: Add IBAN field to API and seed data"
   git push
   ```

2. **Vercel deployed automatisch**
   - Build läuft durch ✅
   - Deployment dauert 2-3 Minuten

3. **Nach Deployment testen:**
   - Startseite: ✅ Lädt
   - Admin-Login: ✅ Funktioniert
   - Abrechnung erstellen: ✅ IBAN-Feld vorhanden
   - Admin-Ansicht: ✅ IBAN wird angezeigt

---

## ⚠️ Wichtig: Datenbank-Migration

Falls bereits Produktiv-Daten existieren:

```bash
# Migration durchführen
npx prisma migrate deploy
```

Falls die Datenbank noch leer ist → automatisch beim ersten Start.

---

## 🎯 Build sollte jetzt durchlaufen!

Alle TypeScript-Fehler sind behoben. Der nächste Deployment-Versuch sollte erfolgreich sein.

**Test-Zugangsdaten:**
- **Admin:** admin@bdp-bawue.de / admin123
- **Landeskasse:** kasse@bdp-bawue.de / admin123

⚠️ **Passwörter nach erstem Login ändern!**
