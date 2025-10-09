# Matilde - Update & Deployment Anleitung
**Abrechnungssystem für BdP Landesverband Baden-Württemberg e.V.**

## 🎉 Was ist neu in dieser Version?

### ✅ Behobene Probleme
1. **Admin-Bereich funktioniert jetzt** - SessionProvider wurde hinzugefügt
2. **Vereinfachte Startseite** - Button prominent in der Mitte, Admin-Button oben rechts

### ✨ Neue Features
1. **IBAN-Feld** - Teilnehmende können ihre IBAN für Rückerstattungen angeben
2. **Multi-Entry-Funktion** - Mehrere Abrechnungen für die gleiche Aktion ohne Daten neu einzugeben
3. **Verbesserte UX** - Persönliche Daten bleiben erhalten, Gesamtbetrag-Anzeige

## 📋 Deployment-Schritte

### 1. Code aktualisieren
```bash
# Navigiere zum Projektordner
cd bdp-clean

# Stoppe die laufende Anwendung (falls aktiv)
# Ctrl+C oder kill den Prozess
```

### 2. Datenbank-Migration durchführen
```bash
# WICHTIG: Führe diese Migration aus, bevor du die App startest
npx prisma migrate dev --name add_iban_field

# Alternative: Manuelle Migration (wenn oben nicht funktioniert)
psql $DATABASE_URL -f prisma/migration-add-iban.sql
```

### 3. Prisma Client neu generieren
```bash
npx prisma generate
```

### 4. Anwendung neu starten
```bash
# Development
npm run dev

# Production (auf dem Server)
npm run build
npm start
```

## 🔐 Admin-Zugang

### Landeskasse Admin-Account
- **E-Mail:** kasse@bdp-bawue.de
- **Passwort:** admin123
- **Rolle:** LANDESKASSE (Vollzugriff auf alle Aktionen)

### Standard Admin-Account
- **E-Mail:** admin@bdp-bawue.de  
- **Passwort:** admin123
- **Rolle:** ADMIN

### Passwort ändern
```bash
# Wichtig: Ändere das Passwort nach dem ersten Login!
# Im Admin-Bereich oder via Prisma Studio:
npx prisma studio
```

## 📧 E-Mail-Konfiguration

Die E-Mail-Funktion ist noch nicht aktiv. Du musst folgende Umgebungsvariablen setzen:

```bash
# .env.local
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=deine-email@gmail.com
SMTP_PASSWORD=dein-app-passwort
SMTP_FROM=deine-email@gmail.com
```

**Hinweis für Gmail:**
1. Gehe zu Google Account → Security
2. Aktiviere "2-Step Verification"
3. Erstelle ein "App Password" für die Anwendung
4. Verwende dieses App Password als `SMTP_PASSWORD`

## 🆕 Neue Funktionen im Detail

### IBAN-Eingabe
- Pflichtfeld im Abrechnungsformular
- Wird in der Admin-Übersicht angezeigt
- Format: DE + 20 Stellen (nicht validiert, kann erweitert werden)

### Multi-Entry-Funktion
1. **Persönliche Daten** werden einmal eingegeben (Name, Stamm, E-Mail, IBAN, Aktion)
2. **Mehrere Einträge** können hinzugefügt werden mit "Weiteren Eintrag hinzufügen"
3. **Gesamtbetrag** wird automatisch berechnet
4. Alle Einträge werden beim Absenden gleichzeitig erstellt
5. Nach erfolgreichem Absenden bleiben persönliche Daten erhalten für weitere Abrechnungen

### Vereinfachte Startseite
- Großer "Neue Abrechnung erstellen" Button in der Mitte
- Admin-Button bleibt in der Navigation oben rechts
- Kurze Erklärung für Teilnehmende
- Technische Details entfernt

## 🧪 Testen der neuen Features

### Test 1: Admin-Bereich
```
1. Öffne http://localhost:3000/admin
2. Du solltest zur Login-Seite weitergeleitet werden
3. Logge dich ein mit kasse@bdp-bawue.de / admin123
4. Du solltest das Dashboard sehen mit allen Abrechnungen
```

### Test 2: Multi-Entry
```
1. Öffne http://localhost:3000/abrechnung
2. Fülle persönliche Daten aus (inkl. IBAN)
3. Füge einen Eintrag hinzu (z.B. Verpflegung)
4. Klicke auf "Weiteren Eintrag hinzufügen"
5. Füge einen zweiten Eintrag hinzu (z.B. Material)
6. Sende ab - beide Einträge sollten erstellt werden
```

### Test 3: IBAN-Anzeige
```
1. Erstelle eine Abrechnung mit IBAN
2. Gehe zum Admin-Bereich
3. Die IBAN sollte in der Tabelle sichtbar sein
```

## 🐛 Bekannte Probleme & Lösungen

### Problem: "Column 'iban' does not exist"
**Lösung:** Migration wurde nicht ausgeführt
```bash
npx prisma migrate dev --name add_iban_field
```

### Problem: Admin-Seite zeigt "Loading..." für immer
**Lösung:** Session-Cookie löschen oder Inkognito-Modus verwenden

### Problem: E-Mail-Versand funktioniert nicht
**Status:** E-Mail ist noch nicht konfiguriert
**ToDo:** SMTP-Einstellungen in .env.local hinzufügen (siehe oben)

## 📁 Geänderte Dateien

Diese Dateien wurden geändert/erstellt:
```
✏️  src/app/page.tsx (vereinfacht)
✏️  src/app/layout.tsx (SessionProvider hinzugefügt)
✏️  src/app/abrechnung/page.tsx (komplett neu mit Multi-Entry)
✏️  src/app/admin/page.tsx (IBAN-Spalte hinzugefügt)
✏️  prisma/schema.prisma (IBAN-Feld hinzugefügt)
✨  src/components/SessionProvider.tsx (neu)
✨  prisma/migration-add-iban.sql (neu)
```

## 🚀 Nächste Schritte

1. ✅ **Jetzt:** Deployment testen
2. 📧 **Bald:** E-Mail-Konfiguration
3. 🎨 **Optional:** BdP-Logo zur Navigation hinzufügen
4. 🔍 **Optional:** IBAN-Validierung implementieren
5. 📊 **Optional:** Export-Funktion für Excel

## 📞 Support

Bei Problemen:
1. Prüfe die Browser-Konsole (F12)
2. Prüfe die Server-Logs
3. Prüfe die Datenbank mit `npx prisma studio`

## 🎯 Quick Commands

```bash
# Datenbank zurücksetzen und neu seeden
npx prisma migrate reset

# Prisma Studio öffnen (Datenbank-GUI)
npx prisma studio

# Build für Production
npm run build

# Logs anzeigen (Production)
pm2 logs
```
