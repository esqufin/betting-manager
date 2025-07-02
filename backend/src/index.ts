import express from "express";
import { PrismaClient } from "@prisma/client";
import betsRouter from "./api/bets"; // Pfad ggf. anpassen
import cors from "cors";
import channelsRouter from "./api/channels";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());
app.use("/api/bets", betsRouter);
app.use("/channels", channelsRouter);

app.get("/", (req, res) => {
  res.send("API läuft!");
});

// Beispielroute für Kanäle
app.get("/channels", async (req, res) => {
  const channels = await prisma.channel.findMany();
  res.json(channels);
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
