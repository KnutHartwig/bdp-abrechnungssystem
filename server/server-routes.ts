import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { z } from 'zod';
import * as storage from './storage';
import { abrechnungSchema, belegSchema, aktionSchema } from '../shared/schema';
import { generateAbrechnungPDF } from './pdfGenerator';
import { 
  sendAbrechnungEmail, 
  sendConfirmationEmail, 
  sendRejectionEmail 
} from './emailService';
import { requireAuth, requireLandeskasse } from './replitAuth';

const router = express.Router();

// ============================================================================
// DATEI-UPLOAD KONFIGURATION
// ============================================================================

const uploadDir = path.join(process.cwd(), 'uploads');

// Erstelle Upload-Verzeichnis falls nicht vorhanden
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `beleg-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Nur JPG, PNG und PDF Dateien sind erlaubt'));
    }
  }
});

// ============================================================================
// ÖFFENTLICHE ROUTEN (ohne Auth)
// ============================================================================

/**
 * GET /api/aktionen/public
 * Gibt nur aktive Aktionen zurück (für öffentliches Formular)
 */
router.get('/api/aktionen/public', async (req, res) => {
  try {
    const aktionen = await storage.getAktionen();
    const aktiveAktionen = aktionen.filter(a => a.status === 'AKTIV');
    res.json(aktiveAktionen);
  } catch (error) {
    console.error('Fehler beim Abrufen der Aktionen:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Aktionen' });
  }
});

/**
 * POST /api/abrechnungen
 * Erstellt eine neue Abrechnung (öffentlich zugänglich)
 */
router.post('/api/abrechnungen', async (req, res) => {
  try {
    const validatedData = abrechnungSchema.parse(req.body);
    
    // Prüfe ob Aktion existiert
    const aktion = await storage.getAktionById(validatedData.aktionId);
    if (!aktion) {
      return res.status(404).json({ error: 'Aktion nicht gefunden' });
    }
    
    // Prüfe ob Aktion aktiv ist
    if (aktion.status !== 'AKTIV') {
      return res.status(400).json({ error: 'Diese Aktion ist nicht mehr aktiv' });
    }
    
    const abrechnung = await storage.createAbrechnung(validatedData);
    res.status(201).json(abrechnung);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validierungsfehler', details: error.errors });
    }
    console.error('Fehler beim Erstellen der Abrechnung:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen der Abrechnung' });
  }
});

/**
 * POST /api/belege
 * Fügt einen Beleg zu einer Abrechnung hinzu (mit Datei-Upload)
 */
router.post('/api/belege', upload.single('datei'), async (req, res) => {
  try {
    const belegData = {
      ...req.body,
      betrag: parseFloat(req.body.betrag),
      abrechnungId: parseInt(req.body.abrechnungId),
      dateiPfad: req.file ? `/uploads/${req.file.filename}` : undefined
    };
    
    const validatedData = belegSchema.parse(belegData);
    
    // Prüfe ob Abrechnung existiert
    const abrechnung = await storage.getAbrechnungById(validatedData.abrechnungId);
    if (!abrechnung) {
      // Lösche hochgeladene Datei
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      return res.status(404).json({ error: 'Abrechnung nicht gefunden' });
    }
    
    // Prüfe ob Abrechnung noch bearbeitet werden kann
    if (abrechnung.status !== 'ENTWURF') {
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      return res.status(400).json({ error: 'Diese Abrechnung kann nicht mehr bearbeitet werden' });
    }
    
    const beleg = await storage.createBeleg(validatedData);
    res.status(201).json(beleg);
  } catch (error) {
    // Lösche hochgeladene Datei bei Fehler
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validierungsfehler', details: error.errors });
    }
    console.error('Fehler beim Erstellen des Belegs:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Belegs' });
  }
});

/**
 * GET /api/belege/:abrechnungId
 * Gibt alle Belege einer Abrechnung zurück
 */
router.get('/api/belege/:abrechnungId', async (req, res) => {
  try {
    const abrechnungId = parseInt(req.params.abrechnungId);
    const belege = await storage.getBelegeByAbrechnungId(abrechnungId);
    res.json(belege);
  } catch (error) {
    console.error('Fehler beim Abrufen der Belege:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Belege' });
  }
});

/**
 * DELETE /api/belege/:id
 * Löscht einen Beleg (nur wenn Abrechnung noch Entwurf ist)
 */
router.delete('/api/belege/:id', async (req, res) => {
  try {
    const belegId = parseInt(req.params.id);
    const beleg = await storage.getBelegById(belegId);
    
    if (!beleg) {
      return res.status(404).json({ error: 'Beleg nicht gefunden' });
    }
    
    // Prüfe ob Abrechnung noch bearbeitet werden kann
    const abrechnung = await storage.getAbrechnungById(beleg.abrechnungId);
    if (!abrechnung || abrechnung.status !== 'ENTWURF') {
      return res.status(400).json({ error: 'Dieser Beleg kann nicht mehr gelöscht werden' });
    }
    
    // Lösche Datei falls vorhanden
    if (beleg.dateiPfad) {
      const filePath = path.join(process.cwd(), beleg.dateiPfad);
      await fs.unlink(filePath).catch(console.error);
    }
    
    await storage.deleteBeleg(belegId);
    res.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Löschen des Belegs:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Belegs' });
  }
});

/**
 * PUT /api/abrechnungen/:id/einreichen
 * Reicht eine Abrechnung ein (generiert PDF, versendet E-Mail)
 */
router.put('/api/abrechnungen/:id/einreichen', async (req, res) => {
  try {
    const abrechnungId = parseInt(req.params.id);
    const abrechnung = await storage.getAbrechnungById(abrechnungId);
    
    if (!abrechnung) {
      return res.status(404).json({ error: 'Abrechnung nicht gefunden' });
    }
    
    if (abrechnung.status !== 'ENTWURF') {
      return res.status(400).json({ error: 'Diese Abrechnung wurde bereits eingereicht' });
    }
    
    // Hole Aktion und Belege
    const aktion = await storage.getAktionById(abrechnung.aktionId);
    if (!aktion) {
      return res.status(404).json({ error: 'Aktion nicht gefunden' });
    }
    
    const belege = await storage.getBelegeByAbrechnungId(abrechnungId);
    
    // Generiere PDF
    const pdfBuffer = await generateAbrechnungPDF({
      ...abrechnung,
      belege,
      aktionName: aktion.name,
      aktionZeitraum: `${new Date(aktion.startDatum).toLocaleDateString('de-DE')} - ${new Date(aktion.endDatum).toLocaleDateString('de-DE')}`,
      aktionOrt: aktion.ort
    });
    
    // Speichere PDF
    const outputDir = path.join(process.cwd(), 'output');
    await fs.mkdir(outputDir, { recursive: true });
    
    const pdfFilename = `Abrechnung_${aktion.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
    const pdfPath = path.join(outputDir, pdfFilename);
    await fs.writeFile(pdfPath, pdfBuffer);
    
    // Aktualisiere Abrechnung
    const updatedAbrechnung = await storage.updateAbrechnungStatus(
      abrechnungId,
      'EINGEREICHT',
      `/output/${pdfFilename}`
    );
    
    // Versende E-Mails
    try {
      await sendAbrechnungEmail(updatedAbrechnung, pdfBuffer, aktion.name);
      await sendConfirmationEmail(updatedAbrechnung, aktion.name);
    } catch (emailError) {
      console.error('E-Mail-Versand fehlgeschlagen:', emailError);
      // Abrechnung wurde trotzdem eingereicht, nur E-Mail fehlgeschlagen
    }
    
    res.json(updatedAbrechnung);
  } catch (error) {
    console.error('Fehler beim Einreichen der Abrechnung:', error);
    res.status(500).json({ error: 'Fehler beim Einreichen der Abrechnung' });
  }
});

// ============================================================================
// ADMIN-ROUTEN (mit Auth)
// ============================================================================

/**
 * GET /api/auth/check
 * Prüft den Auth-Status
 */
router.get('/api/auth/check', requireAuth, (req, res) => {
  res.json({ 
    authenticated: true, 
    user: req.user 
  });
});

/**
 * GET /api/aktionen
 * Gibt alle Aktionen des angemeldeten Admins zurück
 */
router.get('/api/aktionen', requireAuth, async (req, res) => {
  try {
    const aktionen = await storage.getAktionenByAdmin(req.user!.id);
    res.json(aktionen);
  } catch (error) {
    console.error('Fehler beim Abrufen der Aktionen:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Aktionen' });
  }
});

/**
 * GET /api/aktionen/all
 * Gibt alle Aktionen zurück (nur Landeskasse)
 */
router.get('/api/aktionen/all', requireLandeskasse, async (req, res) => {
  try {
    const aktionen = await storage.getAktionen();
    res.json(aktionen);
  } catch (error) {
    console.error('Fehler beim Abrufen der Aktionen:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Aktionen' });
  }
});

/**
 * POST /api/aktionen
 * Erstellt eine neue Aktion
 */
router.post('/api/aktionen', requireAuth, async (req, res) => {
  try {
    const validatedData = aktionSchema.parse({
      ...req.body,
      adminId: req.user!.id
    });
    
    const aktion = await storage.createAktion(validatedData);
    res.status(201).json(aktion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validierungsfehler', details: error.errors });
    }
    console.error('Fehler beim Erstellen der Aktion:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen der Aktion' });
  }
});

/**
 * PUT /api/aktionen/:id
 * Aktualisiert eine Aktion
 */
router.put('/api/aktionen/:id', requireAuth, async (req, res) => {
  try {
    const aktionId = parseInt(req.params.id);
    const aktion = await storage.getAktionById(aktionId);
    
    if (!aktion) {
      return res.status(404).json({ error: 'Aktion nicht gefunden' });
    }
    
    // Prüfe Berechtigung (nur eigene Aktionen oder Landeskasse)
    if (aktion.adminId !== req.user!.id && req.user!.rolle !== 'LANDESKASSE') {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    
    const updatedAktion = await storage.updateAktion(aktionId, req.body);
    res.json(updatedAktion);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Aktion:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Aktion' });
  }
});

/**
 * DELETE /api/aktionen/:id
 * Löscht eine Aktion
 */
router.delete('/api/aktionen/:id', requireAuth, async (req, res) => {
  try {
    const aktionId = parseInt(req.params.id);
    const aktion = await storage.getAktionById(aktionId);
    
    if (!aktion) {
      return res.status(404).json({ error: 'Aktion nicht gefunden' });
    }
    
    // Prüfe Berechtigung
    if (aktion.adminId !== req.user!.id && req.user!.rolle !== 'LANDESKASSE') {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    
    await storage.deleteAktion(aktionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Löschen der Aktion:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Aktion' });
  }
});

/**
 * GET /api/abrechnungen
 * Gibt alle Abrechnungen des angemeldeten Admins zurück
 */
router.get('/api/abrechnungen', requireAuth, async (req, res) => {
  try {
    const abrechnungen = await storage.getAbrechnungenByAdmin(req.user!.id);
    res.json(abrechnungen);
  } catch (error) {
    console.error('Fehler beim Abrufen der Abrechnungen:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Abrechnungen' });
  }
});

/**
 * GET /api/abrechnungen/all
 * Gibt alle Abrechnungen zurück (nur Landeskasse)
 */
router.get('/api/abrechnungen/all', requireLandeskasse, async (req, res) => {
  try {
    const abrechnungen = await storage.getAbrechnungen();
    res.json(abrechnungen);
  } catch (error) {
    console.error('Fehler beim Abrufen der Abrechnungen:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Abrechnungen' });
  }
});

/**
 * GET /api/abrechnungen/:id
 * Gibt eine einzelne Abrechnung zurück
 */
router.get('/api/abrechnungen/:id', requireAuth, async (req, res) => {
  try {
    const abrechnungId = parseInt(req.params.id);
    const abrechnung = await storage.getAbrechnungById(abrechnungId);
    
    if (!abrechnung) {
      return res.status(404).json({ error: 'Abrechnung nicht gefunden' });
    }
    
    // Prüfe Berechtigung
    const aktion = await storage.getAktionById(abrechnung.aktionId);
    if (!aktion) {
      return res.status(404).json({ error: 'Aktion nicht gefunden' });
    }
    
    if (aktion.adminId !== req.user!.id && req.user!.rolle !== 'LANDESKASSE') {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    
    res.json(abrechnung);
  } catch (error) {
    console.error('Fehler beim Abrufen der Abrechnung:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Abrechnung' });
  }
});

/**
 * PUT /api/abrechnungen/:id/versenden
 * Versendet eine Abrechnung per E-Mail (Landeskasse)
 */
router.put('/api/abrechnungen/:id/versenden', requireLandeskasse, async (req, res) => {
  try {
    const abrechnungId = parseInt(req.params.id);
    const abrechnung = await storage.getAbrechnungById(abrechnungId);
    
    if (!abrechnung) {
      return res.status(404).json({ error: 'Abrechnung nicht gefunden' });
    }
    
    if (abrechnung.status !== 'EINGEREICHT') {
      return res.status(400).json({ error: 'Diese Abrechnung kann nicht versendet werden' });
    }
    
    // Hole Aktion und Belege
    const aktion = await storage.getAktionById(abrechnung.aktionId);
    if (!aktion) {
      return res.status(404).json({ error: 'Aktion nicht gefunden' });
    }
    
    const belege = await storage.getBelegeByAbrechnungId(abrechnungId);
    
    // Generiere PDF neu (falls noch nicht vorhanden)
    let pdfBuffer: Buffer;
    
    if (abrechnung.pdfPfad) {
      // Lade vorhandenes PDF
      const pdfPath = path.join(process.cwd(), abrechnung.pdfPfad);
      pdfBuffer = await fs.readFile(pdfPath);
    } else {
      // Generiere neues PDF
      pdfBuffer = await generateAbrechnungPDF({
        ...abrechnung,
        belege,
        aktionName: aktion.name,
        aktionZeitraum: `${new Date(aktion.startDatum).toLocaleDateString('de-DE')} - ${new Date(aktion.endDatum).toLocaleDateString('de-DE')}`,
        aktionOrt: aktion.ort
      });
    }
    
    // Versende E-Mail
    await sendAbrechnungEmail(abrechnung, pdfBuffer, aktion.name);
    
    // Aktualisiere Status
    const updatedAbrechnung = await storage.updateAbrechnungStatus(
      abrechnungId,
      'VERSENDET'
    );
    
    res.json(updatedAbrechnung);
  } catch (error) {
    console.error('Fehler beim Versenden der Abrechnung:', error);
    res.status(500).json({ error: 'Fehler beim Versenden der Abrechnung' });
  }
});

/**
 * PUT /api/abrechnungen/:id/ablehnen
 * Lehnt eine Abrechnung ab und sendet Rückmeldung (Landeskasse)
 */
router.put('/api/abrechnungen/:id/ablehnen', requireLandeskasse, async (req, res) => {
  try {
    const abrechnungId = parseInt(req.params.id);
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: 'Grund für Ablehnung muss angegeben werden' });
    }
    
    const abrechnung = await storage.getAbrechnungById(abrechnungId);
    
    if (!abrechnung) {
      return res.status(404).json({ error: 'Abrechnung nicht gefunden' });
    }
    
    // Hole Aktion
    const aktion = await storage.getAktionById(abrechnung.aktionId);
    if (!aktion) {
      return res.status(404).json({ error: 'Aktion nicht gefunden' });
    }
    
    // Setze Status auf ENTWURF zurück
    const updatedAbrechnung = await storage.updateAbrechnungStatus(
      abrechnungId,
      'ENTWURF'
    );
    
    // Versende Ablehnungs-E-Mail
    try {
      await sendRejectionEmail(updatedAbrechnung, aktion.name, reason);
    } catch (emailError) {
      console.error('E-Mail-Versand fehlgeschlagen:', emailError);
    }
    
    res.json(updatedAbrechnung);
  } catch (error) {
    console.error('Fehler beim Ablehnen der Abrechnung:', error);
    res.status(500).json({ error: 'Fehler beim Ablehnen der Abrechnung' });
  }
});

/**
 * GET /api/abrechnungen/:id/pdf
 * Gibt das PDF einer Abrechnung zurück
 */
router.get('/api/abrechnungen/:id/pdf', requireAuth, async (req, res) => {
  try {
    const abrechnungId = parseInt(req.params.id);
    const abrechnung = await storage.getAbrechnungById(abrechnungId);
    
    if (!abrechnung) {
      return res.status(404).json({ error: 'Abrechnung nicht gefunden' });
    }
    
    // Prüfe Berechtigung
    const aktion = await storage.getAktionById(abrechnung.aktionId);
    if (!aktion) {
      return res.status(404).json({ error: 'Aktion nicht gefunden' });
    }
    
    if (aktion.adminId !== req.user!.id && req.user!.rolle !== 'LANDESKASSE') {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    
    // Hole Belege
    const belege = await storage.getBelegeByAbrechnungId(abrechnungId);
    
    // Generiere PDF
    const pdfBuffer = await generateAbrechnungPDF({
      ...abrechnung,
      belege,
      aktionName: aktion.name,
      aktionZeitraum: `${new Date(aktion.startDatum).toLocaleDateString('de-DE')} - ${new Date(aktion.endDatum).toLocaleDateString('de-DE')}`,
      aktionOrt: aktion.ort
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Abrechnung_${aktion.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Fehler beim Generieren des PDFs:', error);
    res.status(500).json({ error: 'Fehler beim Generieren des PDFs' });
  }
});

// ============================================================================
// STATISTIK-ROUTEN (Landeskasse)
// ============================================================================

/**
 * GET /api/stats
 * Gibt Statistiken zurück (Landeskasse)
 */
router.get('/api/stats', requireLandeskasse, async (req, res) => {
  try {
    const abrechnungen = await storage.getAbrechnungen();
    const aktionen = await storage.getAktionen();
    
    const stats = {
      totalAbrechnungen: abrechnungen.length,
      entwuerfe: abrechnungen.filter(a => a.status === 'ENTWURF').length,
      eingereicht: abrechnungen.filter(a => a.status === 'EINGEREICHT').length,
      versendet: abrechnungen.filter(a => a.status === 'VERSENDET').length,
      totalAktionen: aktionen.length,
      aktiveAktionen: aktionen.filter(a => a.status === 'AKTIV').length,
      abgeschlosseneAktionen: aktionen.filter(a => a.status === 'ABGESCHLOSSEN').length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Fehler beim Abrufen der Statistiken:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Statistiken' });
  }
});

// ============================================================================
// BENUTZER-ROUTEN
// ============================================================================

/**
 * GET /api/users
 * Gibt alle Benutzer zurück (Landeskasse)
 */
router.get('/api/users', requireLandeskasse, async (req, res) => {
  try {
    const users = await storage.getUsers();
    res.json(users);
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzer:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Benutzer' });
  }
});

/**
 * PUT /api/users/:id/rolle
 * Ändert die Rolle eines Benutzers (Landeskasse)
 */
router.put('/api/users/:id/rolle', requireLandeskasse, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { rolle } = req.body;
    
    if (!['ADMIN', 'LANDESKASSE'].includes(rolle)) {
      return res.status(400).json({ error: 'Ungültige Rolle' });
    }
    
    const user = await storage.updateUserRolle(userId, rolle);
    res.json(user);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Benutzerrolle:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Benutzerrolle' });
  }
});

export default router;
