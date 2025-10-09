# MODUL 2: AUTHENTIFIZIERUNG
## BdP Abrechnungssystem

---

## 📦 ENTHALTENE DATEIEN

```
modul2/
├── server/
│   ├── replitAuth.ts      (OpenID Connect Integration)
│   └── routes.ts          (Auth-Routen & Middleware)
├── client/
│   └── src/
│       ├── lib/
│       │   └── auth.tsx   (React Auth Context)
│       └── pages/
│           └── AdminLogin.tsx (Login-Seite)
└── README.md              (Diese Datei)
```

---

## 🚀 INSTALLATION

### Schritt 1: Dateien kopieren

Kopiere die Dateien aus diesem Ordner in dein Projekt:

```
modul2/server/replitAuth.ts      → bdp-abrechnungssystem/server/replitAuth.ts
modul2/server/routes.ts          → bdp-abrechnungssystem/server/routes.ts
modul2/client/src/lib/auth.tsx   → bdp-abrechnungssystem/client/src/lib/auth.tsx
modul2/client/src/pages/AdminLogin.tsx → bdp-abrechnungssystem/client/src/pages/AdminLogin.tsx
```

**WICHTIG:** Die Datei `routes.ts` enthält NUR die Auth-Routen. Die vollständige `routes.ts` mit allen API-Routen wird in späteren Modulen erweitert.

---

## ⚙️ KONFIGURATION

### Environment Variables (.env)

Füge diese Variablen zu deiner `.env` Datei hinzu:

```env
# Session Secret (generieren mit: openssl rand -base64 32)
SESSION_SECRET=dein_generierter_secret_key_hier

# Replit Auth (bei Replit Deployment automatisch)
REPL_ID=deine_repl_id
ISSUER_URL=https://replit.com/oidc

# Node Environment
NODE_ENV=development
```

### Railway Deployment

Bei Railway werden die Environment Variables im Dashboard gesetzt:
1. Railway Dashboard öffnen
2. Dein Projekt auswählen
3. "Variables" Tab
4. Hinzufügen:
   - `SESSION_SECRET` = [generieren mit: openssl rand -base64 32]
   - `NODE_ENV` = production
   - `REPL_ID` = (optional, wenn du Replit Auth nutzt)

---

## 🔧 ABHÄNGIGKEITEN

### NPM Packages

Diese Packages müssen installiert sein:

```bash
npm install openid-client express-session
npm install --save-dev @types/express-session
```

**Falls nicht vorhanden, zu package.json hinzufügen:**

```json
{
  "dependencies": {
    "openid-client": "^5.6.5",
    "express-session": "^1.18.0"
  },
  "devDependencies": {
    "@types/express-session": "^1.18.0"
  }
}
```

---

## 📋 MODUL-ABHÄNGIGKEITEN

Dieses Modul benötigt:

**MODUL 1 - Datenbank (muss vorher erstellt sein):**
- `server/db.ts` (User-Tabelle)
- `server/storage.ts` (getUserById, getUserByReplitId, createUser)

**Verwendete Funktionen:**
```typescript
storage.getUserById(userId)
storage.getUserByReplitId(replitId)
storage.createUser({ replitId, name, email, rolle })
```

---

## 🔐 FUNKTIONEN

### Backend (server/)

**replitAuth.ts:**
- `initializeReplitAuth()` - OpenID Connect initialisieren
- `generateAuthUrl()` - Login-URL mit PKCE generieren
- `handleCallback()` - OAuth Callback verarbeiten
- `isAuthAvailable()` - Prüfen ob Auth verfügbar

**routes.ts:**
- `GET /api/auth/login` - Login starten
- `GET /api/auth/callback` - OAuth Callback
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Aktuellen User abrufen
- Middleware: `requireAuth`, `requireAdmin`, `requireLandeskasse`

### Frontend (client/)

**auth.tsx:**
- `AuthProvider` - Context Provider für App
- `useAuth()` - Hook für Auth-State
- `ProtectedRoute` - Geschützte Routen
- `LandeskasseRoute` - Nur für Landeskasse

**AdminLogin.tsx:**
- Login-Seite mit Replit Auth Button
- Error-Handling
- Redirect nach Login

---

## 🧪 TESTEN

### 1. Development Server starten

```bash
npm run dev
```

### 2. Login-Seite öffnen

```
http://localhost:5000/admin/login
```

### 3. Login testen

- Klicke auf "Mit Replit anmelden"
- Melde dich mit deinem Replit-Account an
- Du wirst zu `/admin` weitergeleitet

### 4. Session prüfen

```bash
# Im Browser Console:
fetch('/api/auth/me', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
```

Erwartete Antwort:
```json
{
  "id": 1,
  "name": "Dein Name",
  "email": "deine@email.de",
  "rolle": "ADMIN"
}
```

---

## 🔄 INTEGRATION IN HAUPTDATEI

### server/index.ts erweitern

```typescript
import express from "express";
import session from "express-session";
import { initializeReplitAuth } from "./replitAuth";
import { router } from "./routes";

const app = express();

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 Stunden
    },
  })
);

// Routes
app.use(router);

// Auth initialisieren
await initializeReplitAuth();

app.listen(5000, () => {
  console.log("Server läuft auf Port 5000");
});
```

### client/src/main.tsx erweitern

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./lib/auth";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

---

## 🛡️ SICHERHEIT

### Session Secret

**NIEMALS** den Session Secret in Git committen!

Generiere einen neuen Secret:
```bash
openssl rand -base64 32
```

### Cookie Einstellungen

Für Produktion (Railway):
```typescript
cookie: {
  secure: true,        // Nur HTTPS
  httpOnly: true,      // Kein JS-Zugriff
  sameSite: 'strict',  // CSRF-Schutz
  maxAge: 24 * 60 * 60 * 1000
}
```

---

## 🐛 TROUBLESHOOTING

### Problem: "Replit Auth nicht verfügbar"

**Lösung:** REPL_ID in Environment Variables setzen

```bash
# .env
REPL_ID=deine_repl_id
```

### Problem: "Session-Daten fehlen"

**Lösung:** Prüfe SESSION_SECRET

```bash
# .env
SESSION_SECRET=generierter_secret_hier
```

### Problem: "Login-Redirect funktioniert nicht"

**Lösung:** Redirect URI prüfen

Bei Replit: `https://{REPL_ID}.repl.co/api/auth/callback`
Bei Railway: `https://{projekt}.up.railway.app/api/auth/callback`
Development: `http://localhost:5000/api/auth/callback`

### Problem: TypeScript-Fehler bei Session

**Lösung:** Type Declaration hinzufügen

```typescript
// In routes.ts bereits enthalten:
declare module "express-session" {
  interface SessionData {
    userId?: number;
    state?: string;
    codeVerifier?: string;
  }
}
```

---

## 📚 NÄCHSTE SCHRITTE

Nach Installation von Modul 2:

1. ✅ **Modul 1** (Datenbank) muss vorhanden sein
2. ✅ **Modul 2** (Auth) ist jetzt installiert
3. ⏭️ **Modul 3** (Öffentliches Formular) als nächstes
4. ⏭️ **Modul 4** (Admin Dashboard) danach

---

## 📞 SUPPORT

Bei Problemen:
1. Prüfe die Logs: `npm run dev` im Terminal
2. Browser Console öffnen (F12)
3. Network Tab prüfen für API-Fehler
4. Environment Variables prüfen

---

**Version:** 1.0  
**Erstellt:** Januar 2025  
**Kompatibel mit:** BdP Abrechnungssystem v3.0
