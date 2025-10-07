# Matilde v2.0 - OHNE LOGIN

Abrechnungssystem für BdP Landesverband Baden-Württemberg e.V.

**Diese Version hat KEIN Login - direkter Zugriff auf Admin-Bereich!**

## 🚀 Deployment auf Vercel (2 Minuten)

### Voraussetzungen
- Du hast bereits eine **Neon Datenbank** erstellt
- Du hast die **DATABASE_URL** von Neon

### Schritt 1: Code zu GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/DEIN-USERNAME/DEIN-REPO.git
git push -u origin main
```

### Schritt 2: Vercel-Projekt erstellen
1. Gehe zu [vercel.com](https://vercel.com)
2. Klicke "Add New Project"
3. Wähle dein GitHub-Repository
4. Klicke "Import"

### Schritt 3: Environment Variable hinzufügen
Füge diese eine Variable hinzu (Settings → Environment Variables):

```
DATABASE_URL=<deine-neon-database-url>
```

**Beispiel Neon URL:**
```
postgresql://user:password@ep-xyz.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### Schritt 4: Deploy
Klicke "Deploy" - fertig!

Die Datenbank wird automatisch beim Build eingerichtet.

## 📱 Deine App

Nach dem Deployment:

- **Startseite:** `https://deine-app.vercel.app`
- **Abrechnung erstellen:** `https://deine-app.vercel.app/abrechnung`
- **Admin-Bereich:** `https://deine-app.vercel.app/admin` ← **KEIN LOGIN NÖTIG!**

## ⚠️ Wichtig

**Diese Version hat KEINEN Login!** Jeder kann auf den Admin-Bereich zugreifen.
Das ist nur zum Testen gedacht!

## 💻 Lokale Entwicklung

```bash
npm install
cp .env.example .env.local
# Füge deine DATABASE_URL in .env.local ein

npm run db:push
npm run db:seed
npm run dev
```

## 🔧 Was wurde entfernt?

- ❌ NextAuth
- ❌ Login-Seite
- ❌ Passwörter
- ❌ User-Management
- ✅ Direkter Zugriff auf Admin-Bereich

## 📝 Technologie

- Next.js 15
- React 19
- PostgreSQL + Prisma
- Tailwind CSS

Viel Erfolg! 🚀
