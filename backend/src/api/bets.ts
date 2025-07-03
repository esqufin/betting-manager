// /backend/src/api/bets.ts

import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

console.log("betsRouter wurde geladen");

router.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} - Body:`, req.body);
  next();
});

// Alle Wettscheine holen
router.get("/", async (req, res) => {
  try {
    /*     const bets = await prisma.bet.findMany();
    res.json(bets); */
    const bets = await prisma.bet.findMany({
      include: { multiEntries: true },
    });
    res.json(bets);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Datenbankfehler beim Laden der Wettscheine" });
  }
});

// Neuen Wettschein anlegen
router.post("/", async (req, res) => {
  try {
    const { id, multiEntries, ...data } = req.body;
    let newBet;
    if (
      data.kind === "Multi" &&
      Array.isArray(multiEntries) &&
      multiEntries.length
    ) {
      newBet = await prisma.bet.create({
        data: {
          ...data,
          multiEntries: {
            create: multiEntries.map((entry) => ({
              match: entry.match,
              odds: entry.odds,
              pick: entry.pick,
              date: new Date(entry.date),
            })),
          },
        },
        include: { multiEntries: true }, // damit Response gleich Subwetten enthält
      });
    } else {
      newBet = await prisma.bet.create({ data });
    }
    res.status(201).json(newBet);
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({
        error: err.message,
        details: err.stack,
      });
    } else {
      res.status(400).json({
        error: "Fehler beim Anlegen des Wettscheins (unknown error)",
        details: err,
      });
    }
  }
});

// Wettschein bearbeiten
router.put("/:id", async (req, res) => {
  try {
    const betId = Number(req.params.id);
    const { id, multiEntries, ...data } = req.body;
    const updatedBet = await prisma.bet.update({
      where: { id: betId },
      data,
    });
    res.json(updatedBet);
  } catch (err) {
    res.status(400).json({ error: "Fehler beim Bearbeiten des Wettscheins" });
  }
});

// Wettschein löschen
router.delete("/:id", async (req, res) => {
  try {
    const betId = Number(req.params.id);
    await prisma.bet.delete({ where: { id: betId } });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "Fehler beim Löschen des Wettscheins" });
  }
});

export default router;
