import express, { RequestHandler, Router } from "express";
import { PrismaClient } from "@prisma/client";

const router: Router = express.Router();
const prisma = new PrismaClient();

interface IdParam {
  id: string;
}

// Alle Wettscheine holen (inkl. Subwetten)
router.get("/", async (req, res) => {
  try {
    const bets = await prisma.bet.findMany({
      include: { multiEntries: true }, // NEU
    });
    res.json(bets);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Datenbankfehler beim Laden der Wettscheine" });
  }
});

// Einzelnen Wettschein holen
const getBetById: RequestHandler<IdParam> = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Ungültige ID" });
    return;
  }

  try {
    const bet = await prisma.bet.findUnique({
      where: { id },
      include: { multiEntries: true },
    });

    if (!bet) {
      res.status(404).json({ error: "Nicht gefunden" });
      return;
    }

    res.json(bet);
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Laden des Wettscheins" });
  }
};
router.get("/:id", getBetById);

// Neuen Wettschein anlegen (Single oder Multi)
router.post("/", async (req, res) => {
  try {
    // Entferne id (wird von Prisma generiert), nimm ggf. Subwetten entgegen
    const { id, multiEntries, ...data } = req.body;

    if (data.kind === "Multi") {
      // Multi-Bet anlegen
      const newBet = await prisma.bet.create({ data });
      // Subwetten speichern (falls vorhanden)
      if (
        multiEntries &&
        Array.isArray(multiEntries) &&
        multiEntries.length > 0
      ) {
        await prisma.multiEntry.createMany({
          data: multiEntries.map((entry) => ({
            ...entry,
            betId: newBet.id,
          })),
        });
      }
      // Bet mit Subwetten ausliefern
      const betWithEntries = await prisma.bet.findUnique({
        where: { id: newBet.id },
        include: { multiEntries: true },
      });
      res.status(201).json(betWithEntries);
    } else {
      // Single-Bet wie gehabt
      const newBet = await prisma.bet.create({ data });
      res.status(201).json(newBet);
    }
  } catch (err) {
    res.status(400).json({ error: "Fehler beim Anlegen des Wettscheins" });
  }
});

// Wettschein bearbeiten
router.put("/:id", async (req, res) => {
  try {
    const betId = Number(req.params.id);
    const { id, ...data } = req.body;
    const updatedBet = await prisma.bet.update({
      where: { id: betId },
      data,
    });
    res.json(updatedBet);
  } catch (err) {
    res.status(400).json({ error: "Fehler beim Bearbeiten des Wettscheins" });
  }
});

// Wettschein löschen (inkl. Subwetten)
router.delete("/:id", async (req, res) => {
  try {
    const betId = Number(req.params.id);
    // Lösche zuerst Subwetten, falls Multi
    await prisma.multiEntry.deleteMany({ where: { betId } });
    // Lösche dann den Bet selbst
    await prisma.bet.delete({ where: { id: betId } });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "Fehler beim Löschen des Wettscheins" });
  }
});

export default router;
