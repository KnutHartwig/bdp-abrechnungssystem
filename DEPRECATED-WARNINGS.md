# Deprecated Dependencies - Status und Erklärung

## ✅ Behobene Probleme (v1.1.3)

### 1. **Puppeteer** 
- ❌ War: `23.11.1` (deprecated, < 24.15.0)
- ✅ Jetzt: `24.23.0` (neueste stabile Version)
- **Status:** BEHOBEN

### 2. **Node.js Engine**
- ❌ War: `>=18.0.0` (auto-upgrade bei Major-Releases)
- ✅ Jetzt: `18.x` (fixiert auf Major-Version 18)
- **Status:** BEHOBEN

### 3. **CSS Build-Fehler**
- ❌ War: `bg-background`, `text-foreground` (nicht existierende Klassen)
- ✅ Jetzt: `bg-white`, `text-gray-900` (Standard Tailwind)
- **Status:** BEHOBEN

### 4. **UI Libraries aktualisiert**
- ✅ `lucide-react`: 0.427.0 → 0.544.0
- ✅ Alle `@radix-ui/*` Packages auf neueste Versionen

---

## ⚠️ Verbleibende Deprecated Warnings (NICHT BEHEBBAR)

### ESLint 8.57.1 - ABSICHTLICH VERALTET
```
npm warn deprecated eslint@8.57.1: This version is no longer supported.
```

**Warum nicht updaten?**
- ❌ ESLint 9.x benötigt neue Flat Config (Breaking Changes)
- ❌ Next.js 14.2.5 benötigt ESLint 8.x (nicht kompatibel mit 9)
- ✅ ESLint 8.57.1 ist die letzte stabile Version für Next.js 14
- ✅ Funktioniert einwandfrei für unser Projekt

**Lösung:**
- Beim Upgrade auf Next.js 15+ wird ESLint 9 unterstützt
- Aktuell: ESLint 8.57.1 beibehalten

---

### Transitive Dependencies (von anderen Packages)

Diese Warnings kommen von Packages, die UNSERE Dependencies verwenden:

#### 1. `inflight@1.0.6`
```
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory.
```
- **Verwendet von:** `glob` → `rimraf` → verschiedene Build-Tools
- **Warum nicht fixbar:** Transitive Dependency, nicht direkt installiert
- **Risiko:** NIEDRIG (nur während Build, nicht in Production)

#### 2. `rimraf@3.0.2`
```
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
```
- **Verwendet von:** Diverse Build-Tools und Dev-Dependencies
- **Warum nicht fixbar:** Transitive Dependency
- **Risiko:** NIEDRIG (nur Build-Tool)

#### 3. `@humanwhocodes/object-schema@2.0.3`
```
npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
```
- **Verwendet von:** ESLint 8.57.1
- **Warum nicht fixbar:** Kommt mit ESLint 8 (siehe oben)
- **Risiko:** NIEDRIG (wird mit ESLint 9 behoben)

#### 4. `@humanwhocodes/config-array@0.13.0`
```
npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
```
- **Verwendet von:** ESLint 8.57.1
- **Warum nicht fixbar:** Kommt mit ESLint 8 (siehe oben)
- **Risiko:** NIEDRIG (wird mit ESLint 9 behoben)

#### 5. `glob@7.2.3`
```
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
```
- **Verwendet von:** Verschiedene Build-Tools
- **Warum nicht fixbar:** Transitive Dependency
- **Risiko:** NIEDRIG (nur Build-Zeit)

---

## 🎯 Zusammenfassung

| Problem | Status | Lösung |
|---------|--------|--------|
| Puppeteer < 24.15.0 | ✅ BEHOBEN | Update auf 24.23.0 |
| Node Engine Auto-Upgrade | ✅ BEHOBEN | Fixiert auf 18.x |
| CSS Build-Fehler | ✅ BEHOBEN | Tailwind-Klassen korrigiert |
| UI Libraries veraltet | ✅ BEHOBEN | Alle Updates |
| ESLint deprecated | ⚠️ AKZEPTIERT | Next.js 14 benötigt ESLint 8 |
| Transitive Dependencies | ⚠️ AKZEPTIERT | Keine direkte Kontrolle |

---

## 📋 Upgrade-Pfad für Zukunft

### Nächstes Major-Update (v2.0.0):
Wenn Next.js 15+ verwendet wird, dann:

1. ✅ Next.js 14 → 15
2. ✅ ESLint 8 → 9 (mit Flat Config)
3. ✅ React 18 → 19
4. ✅ Alle transitiven Dependencies werden automatisch aktualisiert

### Breaking Changes zu erwarten:
- ESLint Config-Format (Flat Config)
- Next.js App Router Änderungen
- React Server Components Updates

---

## 🔒 Sicherheitsstatus

**Alle kritischen Sicherheitslücken:** ✅ BEHOBEN
- Puppeteer auf aktuelle Version
- Keine bekannten CVEs in aktuellen Dependencies

**Verbleibende Warnings:**
- ⚠️ Sind NUR Deprecation-Warnings
- ⚠️ Keine Security-Risiken
- ⚠️ Nur während Build-Zeit, nicht in Production

---

**Fazit:** Das Projekt ist produktionsbereit und sicher. Die verbleibenden Warnings sind akzeptabel und können beim nächsten Major-Update (Next.js 15) behoben werden.
