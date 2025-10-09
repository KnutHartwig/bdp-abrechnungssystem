# Matilde v2.0

**Abrechnungssystem für BdP Landesverband Baden-Württemberg e.V.**

## Installation

```bash
npm install
cp .env.example .env.local
# .env.local mit deinen Daten bearbeiten
```

## Datenbank

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

## Starten

```bash
npm run dev
```

## Test-Zugänge

- Admin: admin@bdp-bawue.de / admin123
- Kasse: kasse@bdp-bawue.de / admin123

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
