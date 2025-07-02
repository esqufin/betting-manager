import React from "react";
import {
  Stack,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { resultLabels } from "./betConstants";
import { betTypeOptions, pickOptions } from "./betMarketOptions";
import type { BetType } from "./betMarketOptions";
import { Radio, RadioGroup, FormControlLabel } from "@mui/material";

// --- Typ für Subwetten ---
export type MultiEntryInput = {
  match: string;
  betType: BetType | "";
  pick: string;
  odds: number | "";
  goals?: string; // für Toranzahl (Over/Under)
  date: string;
  result?: number;
};

// --- Props für AddBetForm ---
type Props = {
  lang: "de" | "en";
  type: "Single" | "Multi";
  setType: (type: "Single" | "Multi") => void;
  newBet: Omit<any, "id">; // dein Bet-Typ!
  setNewBet: React.Dispatch<React.SetStateAction<Omit<any, "id">>>;
  multiEntries: MultiEntryInput[];
  setMultiEntries: React.Dispatch<React.SetStateAction<MultiEntryInput[]>>;
  loading: boolean;
  onAdd: () => void;
};

const emptyEntry = (date: string): MultiEntryInput => ({
  match: "",
  betType: "",
  pick: "",
  odds: "",
  goals: "",
  date,
  result: 0,
});

export default function AddBetForm({
  lang,
  type,
  setType,
  newBet,
  setNewBet,
  multiEntries,
  setMultiEntries,
  loading,
  onAdd,
}: Props) {
  // Multi: Add Entry
  const handleAddEntry = () => {
    setMultiEntries([...multiEntries, emptyEntry(newBet.date)]);
  };

  // Multi: Remove Entry
  const handleRemoveEntry = (idx: number) => {
    setMultiEntries(multiEntries.filter((_, i) => i !== idx));
  };

  // Multi: Change Entry
  const handleEntryChange = (
    idx: number,
    field: keyof MultiEntryInput,
    value: string
  ) => {
    setMultiEntries(
      multiEntries.map((entry, i) =>
        i === idx
          ? {
              ...entry,
              [field]: field === "odds" ? Number(value) : value,
            }
          : entry
      )
    );
  };

  // Multi: Gesamtquote berechnen
  const totalOdds =
    multiEntries.length > 0 && multiEntries.every((e) => !!e.odds)
      ? multiEntries.reduce(
          (prod, e) => prod * (typeof e.odds === "number" ? e.odds : 1),
          1
        )
      : 0;

  // Für Over/Under & Team Total Over/Under extra goals-Feld
  const needsGoalsField = (betType: string) =>
    betType === "Over/Under" || betType === "Team Total Over/Under";

  return (
    <Box sx={{ border: "1px solid #eee", borderRadius: 2, p: 2, mb: 2 }}>
      {/* Kopfzeile: Typ-Auswahl und Einsatz immer sichtbar */}
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <RadioGroup
          row
          value={type}
          onChange={(e) => setType(e.target.value as "Single" | "Multi")}
          sx={{ mr: 2 }}
        >
          <FormControlLabel value="Single" control={<Radio />} label="Single" />
          <FormControlLabel value="Multi" control={<Radio />} label="Multi" />
        </RadioGroup>
        <TextField
          label={lang === "de" ? "Einsatz" : "Stake"}
          size="small"
          type="number"
          value={newBet.stake}
          onChange={(e) =>
            setNewBet((prev) => ({
              ...prev,
              stake: Number(e.target.value),
            }))
          }
          sx={{ width: 100 }}
          inputProps={{
            inputMode: "decimal",
            pattern: "[0-9]*",
            style: { MozAppearance: "textfield" },
          }}
        />
        <TextField
          label="Currency"
          size="small"
          value={newBet.currency}
          onChange={(e) =>
            setNewBet((prev) => ({ ...prev, currency: e.target.value }))
          }
          sx={{ width: 80 }}
        />
        {type === "Multi" && totalOdds > 0 && (
          <Typography>
            {lang === "de" ? "Gesamtquote" : "Total odds"}:{" "}
            {totalOdds.toFixed(2)}
          </Typography>
        )}
      </Stack>

      {/* Felder für Single oder Multi */}
      {type === "Single" ? (
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Match"
            size="small"
            value={newBet.match}
            onChange={(e) =>
              setNewBet((prev) => ({ ...prev, match: e.target.value }))
            }
          />
          {/* Bet Type Dropdown */}
          <Select
            value={newBet.betType || ""}
            onChange={(e) =>
              setNewBet((prev) => ({ ...prev, betType: e.target.value }))
            }
            size="small"
            sx={{ minWidth: 130 }}
          >
            {betTypeOptions.map((bt) => (
              <MenuItem key={bt} value={bt}>
                {bt}
              </MenuItem>
            ))}
          </Select>
          {/* Pick Dropdown */}
          <Select
            value={newBet.pick || ""}
            onChange={(e) =>
              setNewBet((prev) => ({ ...prev, pick: e.target.value }))
            }
            size="small"
            sx={{ minWidth: 100 }}
            disabled={!newBet.betType}
          >
            {(pickOptions[newBet.betType as BetType] || []).map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </Select>

          <TextField
            label="Odds"
            size="small"
            type="number"
            value={newBet.odds === 0 ? "" : newBet.odds}
            onFocus={() => {
              if (newBet.odds === 0) {
                setNewBet((prev) => ({ ...prev, odds: "" }));
              }
            }}
            onBlur={(e) => {
              if (e.target.value === "") {
                setNewBet((prev) => ({ ...prev, odds: 0 }));
              }
            }}
            onChange={(e) =>
              setNewBet((prev) => ({
                ...prev,
                odds: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            sx={{ width: 80 }}
            inputProps={{
              inputMode: "decimal",
              pattern: "[0-9]*",
              style: { MozAppearance: "textfield" },
            }}
          />

          <TextField
            type="date"
            label={lang === "de" ? "Spiel-Datum" : "Match Date"}
            size="small"
            value={newBet.date?.slice(0, 10) || ""}
            onChange={(e) =>
              setNewBet((prev) => ({
                ...prev,
                date: e.target.value + "T12:00:00.000Z",
              }))
            }
            sx={{ width: 140 }}
            InputLabelProps={{ shrink: true }}
          />
          <Select
            value={newBet.result?.toString() ?? "0"}
            onChange={(e) =>
              setNewBet((prev) => ({
                ...prev,
                result: Number(e.target.value),
              }))
            }
            size="small"
            sx={{ minWidth: 120 }}
            label={lang === "de" ? "Ergebnis" : "Result"}
          >
            {resultLabels[lang].map((label, i) => (
              <MenuItem key={i} value={i.toString()}>
                {label}
              </MenuItem>
            ))}
          </Select>

          <Button variant="contained" onClick={onAdd} disabled={loading}>
            {lang === "de" ? "Wettschein anlegen" : "Add Bet"}
          </Button>
        </Stack>
      ) : (
        <>
          {multiEntries.map((entry, idx) => (
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              key={idx}
              mt={idx === 0 ? 0 : 1}
            >
              <TextField
                label="Match"
                size="small"
                value={entry.match}
                onChange={(e) =>
                  handleEntryChange(idx, "match", e.target.value)
                }
              />
              {/* Bet Type Dropdown */}
              <Select
                value={entry.betType || ""}
                onChange={(e) =>
                  handleEntryChange(idx, "betType", e.target.value)
                }
                size="small"
                sx={{ minWidth: 130 }}
              >
                {betTypeOptions.map((bt) => (
                  <MenuItem key={bt} value={bt}>
                    {bt}
                  </MenuItem>
                ))}
              </Select>
              {/* Pick Dropdown */}
              <Select
                value={entry.pick || ""}
                onChange={(e) => handleEntryChange(idx, "pick", e.target.value)}
                size="small"
                sx={{ minWidth: 100 }}
                disabled={!entry.betType}
              >
                {(pickOptions[entry.betType as BetType] || []).map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
              {/* Toranzahl (bei Over/Under und Team Total) */}
              {needsGoalsField(entry.betType) && (
                <TextField
                  label={lang === "de" ? "Linie" : "Line"}
                  size="small"
                  value={entry.goals || ""}
                  onChange={(e) =>
                    handleEntryChange(idx, "goals", e.target.value)
                  }
                  sx={{ width: 70 }}
                />
              )}
              <TextField
                label="Odds"
                size="small"
                type="number"
                value={entry.odds}
                onChange={(e) => handleEntryChange(idx, "odds", e.target.value)}
                sx={{ width: 80 }}
              />
              <TextField
                type="date"
                label={lang === "de" ? "Spiel-Datum" : "Match Date"}
                size="small"
                value={entry.date.slice(0, 10)}
                onChange={(e) =>
                  handleEntryChange(
                    idx,
                    "date",
                    e.target.value + "T12:00:00.000Z"
                  )
                }
                sx={{ width: 140 }}
                InputLabelProps={{ shrink: true }}
              />
              <Select
                value={entry.result?.toString() ?? "0"}
                onChange={(e) =>
                  handleEntryChange(idx, "result", e.target.value)
                }
                size="small"
                sx={{ minWidth: 120 }}
                label={lang === "de" ? "Ergebnis" : "Result"}
              >
                {resultLabels[lang].map((label, i) => (
                  <MenuItem key={i} value={i.toString()}>
                    {label}
                  </MenuItem>
                ))}
              </Select>

              <IconButton
                onClick={() => handleRemoveEntry(idx)}
                disabled={multiEntries.length === 1}
              >
                <Delete />
              </IconButton>
              {/* Add Bet nur für letzte Zeile */}
              {idx === multiEntries.length - 1 && (
                <IconButton color="primary" onClick={handleAddEntry}>
                  <Add />
                </IconButton>
              )}
              {/* Wettschein anlegen-Button nur für letzte Zeile */}
              {idx === multiEntries.length - 1 && (
                <Button
                  variant="contained"
                  onClick={onAdd}
                  disabled={
                    loading || !newBet.stake || multiEntries.length === 0
                  }
                >
                  {lang === "de" ? "Wettschein anlegen" : "Add Bet"}
                </Button>
              )}
            </Stack>
          ))}
        </>
      )}
    </Box>
  );
}
