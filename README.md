# Matilde v2.0

**Abrechnungssystem für BdP Landesverband Baden-Württemberg e.V.**

## 🚀 Deployment auf Vercel

1. **GitHub:** Push den Code zu GitHub
2. **Vercel:** Verbinde das Repo mit Vercel
3. **Environment Variables:** Konfiguriere in Vercel:
   - `DATABASE_URL` - PostgreSQL-Verbindung (Vercel Postgres)
   - `NEXTAUTH_URL` - Deine App-URL (z.B. https://deine-app.vercel.app)
   - `NEXTAUTH_SECRET` - Generiere mit: `openssl rand -base64 32`
   - Optional: SMTP-Variablen für E-Mail-Versand
4. **Deploy:** Vercel deployed automatisch
5. **Login:** Gehe zu `/admin/login` - Admin-Accounts werden automatisch erstellt!

### Login-Daten (nach erstem Deployment)
- **Admin:** admin@bdp-bawue.de / admin123
- **Kasse:** kasse@bdp-bawue.de / admin123

⚠️ **Wichtig:** Ändere die Passwörter nach dem ersten Login!

## Lokale Entwicklung

```bash
npm install
cp .env.example .env.local
# .env.local mit deinen Daten bearbeiten

# Datenbank
npm run db:generate
npm run db:push
npm run db:seed

# Starten
npm run dev
```

## Umgebungsvariablen (.env.local)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bdp_abrechnungen"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generiere mit: openssl rand -base64 32>"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="deine-email@gmail.com"
SMTP_PASSWORD="dein-app-passwort"
SMTP_FROM="Matilde - BdP Landesverband Baden-Württemberg e.V. <noreply@bdp-bawue.de>"
LANDESKASSE_EMAIL="kasse@bdp-bawue.de"
```

## Technologie

- Next.js 15
- React 19
- PostgreSQL + Prisma
- NextAuth.js
- Tailwind CSS
- Puppeteer (PDF)

## Wichtige Änderungen von v1.x

- `kilometerstand` → `kilometer`
- Neues Feld `kmSatz` bei Abrechnung
- Neues Feld `beschreibung` bei Aktion
- ESLint 9 Flat Config
