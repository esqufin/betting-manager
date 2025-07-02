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
    const bets = await prisma.bet.findMany();
    res.json(bets);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Datenbankfehler beim Laden der Wettscheine" });
  }
});

// Neuen Wettschein anlegen
router.post("/", async (req, res) => {
  console.log("ROUTER POST AUFGERUFEN", req.body); // <--- Test-Log!
  try {
    const { id, ...data } = req.body;
    const newBet = await prisma.bet.create({ data });
    res.status(201).json(newBet);
  } catch (err) {
    if (err instanceof Error) {
      console.error(
        "Fehler beim Anlegen des Wettscheins:",
        err.message,
        err.stack
      );
      res.status(400).json({
        error: err.message,
        details: err.stack,
      });
    } else {
      console.error(
        "Fehler beim Anlegen des Wettscheins (unknown error):",
        err
      );
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
