import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const channels = await prisma.channel.findMany();
  res.json(channels);
});

router.post("/", async (req, res) => {
  try {
    const { name, cashback, type, period, weekStart, monthStart } = req.body;
    const newChannel = await prisma.channel.create({
      data: { name, cashback, type, period, weekStart, monthStart },
    });
    res.status(201).json(newChannel);
  } catch (err) {
    if (err instanceof Error) {
      console.error(
        "Fehler beim Anlegen des Channels:",
        err.message,
        err.stack
      );
      res.status(400).json({
        error: err.message,
        details: err.stack,
      });
    } else {
      res.status(400).json({ error: "Unbekannter Fehler", details: err });
    }
  }
});

export default router;
