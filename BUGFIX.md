# 🐛 Bugfix-Dokumentation - Build-Fehler behoben

## Problem
Vercel Build-Fehler beim Deployment:
```
Property 'iban' is missing in type {...} but required in type 'AbrechnungUncheckedCreateInput'
```

## Ursache
Das `iban`-Feld wurde zum Prisma Schema hinzugefügt (erforderlich für Rückerstattungen), aber die Seed-Datei (`prisma/seed.ts`) wurde nicht aktualisiert.

## ✅ Behobene Dateien

### 1. `prisma/seed.ts`
- **Alle 11 Test-Abrechnungen** aktualisiert
- IBAN-Feld zu jedem Eintrag hinzugefügt
- Format: `DE89370400440532013XXX` (gültige Test-IBANs)

**Beispiel:**
```typescript
await prisma.abrechnung.create({
  data: {
    name: 'Max Mustermann',
    stamm: 'Stamm Heilbronn',
    email: 'max@example.com',
    iban: 'DE89370400440532013000', // ← NEU
    aktionId: sommerlager2025.id,
    // ... restliche Felder
  },
});
```

## 🚀 Deployment-Schritte

### Option 1: Automatisches Deployment (Vercel)
1. Neuen Code zu GitHub pushen
2. Vercel deployed automatisch
3. Build sollte jetzt erfolgreich sein ✅

### Option 2: Manuelles Deployment
1. ZIP entpacken
2. Code zu GitHub pushen
3. In Vercel: "Redeploy"

## 📋 Checkliste nach Deployment

- [ ] Build erfolgreich in Vercel
- [ ] Startseite lädt (https://deine-app.vercel.app)
- [ ] Admin-Login funktioniert (kasse@bdp-bawue.de / admin123)
- [ ] Abrechnungsformular zeigt IBAN-Feld
- [ ] Test-Abrechnung erstellen funktioniert

## ⚠️ Wichtig: Datenbank-Migration

Falls du bereits eine Produktiv-Datenbank hast, musst du **nach** dem Deployment diese Migration ausführen:

```bash
# Lokal im Terminal:
npx prisma migrate dev --name add_iban_field

# Oder direkt auf Vercel:
# Gehe zu Vercel Dashboard → Deployments → ••• → Run Command
# Führe aus: npx prisma migrate deploy
```

Falls die Datenbank leer ist (erste Deployment), funktioniert alles automatisch.

## 🎯 Was ist neu in diesem Build

1. ✅ IBAN-Feld im Schema
2. ✅ IBAN-Feld im Formular (Pflichtfeld)
3. ✅ IBAN-Anzeige im Admin-Bereich
4. ✅ Multi-Entry-Funktion (mehrere Abrechnungen auf einmal)
5. ✅ Vereinfachte Startseite
6. ✅ Admin-Bereich funktioniert (SessionProvider-Fix)
7. ✅ Seed-Daten komplett mit IBAN

## 🐛 Sollte jetzt funktionieren!

Der Build-Fehler ist behoben. Wenn du jetzt deployst, sollte alles durchlaufen.

Bei Fragen oder weiteren Problemen, schau in die `DEPLOYMENT.md` oder melde dich!
