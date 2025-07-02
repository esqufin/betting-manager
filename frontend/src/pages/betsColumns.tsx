import React from "react";
import { TextField, Select, MenuItem } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { resultLabels, typeOptions } from "./betConstants";
import type { Bet, Channel } from "../types/betting";

export function getBetsColumns(
  lang: "de" | "en",
  channels: Channel[],
  editingCell: { rowId: number; colId: string } | null,
  editValue: string,
  setEditingCell: (cell: { rowId: number; colId: string } | null) => void,
  setEditValue: (v: string) => void,
  handleEdit: (bet: Bet, field: keyof Bet, value: any) => void,
  parseValue: (field: keyof Bet, value: string) => string | number
): ColumnDef<Bet, any>[] {
  return [
    {
      accessorKey: "match",
      header: "Match",
      cell: ({ row, column }) =>
        editingCell &&
        editingCell.rowId === row.original.id &&
        editingCell.colId === column.id ? (
          <TextField
            value={editValue}
            size="small"
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={async () => {
              await handleEdit(row.original, column.id as keyof Bet, editValue);
              setEditingCell(null);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await handleEdit(
                  row.original,
                  column.id as keyof Bet,
                  editValue
                );
                setEditingCell(null);
              }
            }}
            autoFocus
          />
        ) : (
          <span
            onDoubleClick={() => {
              setEditingCell({ rowId: row.original.id, colId: column.id });
              setEditValue(row.original.match || "");
            }}
            style={{
              cursor: "pointer",
              color: !row.original.match ? "#bbb" : "inherit",
            }}
          >
            {row.original.match || "[leer]"}
          </span>
        ),
    },
    {
      accessorKey: "stake",
      header: "Stake",
      cell: ({ row, column }) =>
        editingCell &&
        editingCell.rowId === row.original.id &&
        editingCell.colId === column.id ? (
          <TextField
            type="number"
            value={editValue}
            size="small"
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={async () => {
              await handleEdit(
                row.original,
                column.id as keyof Bet,
                Number(editValue)
              );
              setEditingCell(null);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await handleEdit(
                  row.original,
                  column.id as keyof Bet,
                  Number(editValue)
                );
                setEditingCell(null);
              }
            }}
            autoFocus
          />
        ) : (
          <span
            onDoubleClick={() => {
              setEditingCell({ rowId: row.original.id, colId: column.id });
              setEditValue(row.original.stake.toString());
            }}
            style={{ cursor: "pointer" }}
          >
            {row.original.stake}
          </span>
        ),
    },
    {
      accessorKey: "odds",
      header: "Odds",
      cell: ({ row }) => {
        // --- NEU: Multi-Bet Odds dynamisch berechnen ---
        if (
          row.original.kind === "Multi" &&
          Array.isArray(row.original.multiEntries) &&
          row.original.multiEntries.length > 0
        ) {
          const totalOdds = row.original.multiEntries
            .map((e) => Number(e.odds))
            .reduce((acc, odd) => acc * (odd || 1), 1);
          return totalOdds.toFixed(2);
        }
        // Single-Wette: normale Odds
        return row.original.odds;
      },
    },
    {
      accessorKey: "betType",
      header: "Bet Type",
      cell: ({ row, column }) =>
        editingCell &&
        editingCell.rowId === row.original.id &&
        editingCell.colId === column.id ? (
          <TextField
            value={editValue}
            size="small"
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={async () => {
              await handleEdit(row.original, column.id as keyof Bet, editValue);
              setEditingCell(null);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await handleEdit(
                  row.original,
                  column.id as keyof Bet,
                  editValue
                );
                setEditingCell(null);
              }
            }}
            autoFocus
          />
        ) : (
          <span
            onDoubleClick={() => {
              setEditingCell({ rowId: row.original.id, colId: column.id });
              setEditValue(row.original.betType || "");
            }}
            style={{
              cursor: "pointer",
              color: !row.original.betType ? "#bbb" : "inherit",
            }}
          >
            {row.original.betType || "[leer]"}
          </span>
        ),
    },
    {
      header: lang === "de" ? "Pick" : "Pick",
      accessorKey: "pick",
      cell: (info) => info.getValue() || "—",
      enableColumnFilter: false,
    },

    {
      accessorKey: "result",
      header: lang === "de" ? "Ergebnis" : "Result",
      cell: ({ row, column }) =>
        editingCell &&
        editingCell.rowId === row.original.id &&
        editingCell.colId === column.id ? (
          <Select
            value={editValue === "" ? "0" : editValue}
            size="small"
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={async () => {
              await handleEdit(
                row.original,
                column.id as keyof Bet,
                Number(editValue)
              );
              setEditingCell(null);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await handleEdit(
                  row.original,
                  column.id as keyof Bet,
                  Number(editValue)
                );
                setEditingCell(null);
              }
            }}
            autoFocus
            sx={{ minWidth: 120 }}
          >
            {resultLabels[lang].map((label, i) => (
              <MenuItem key={i} value={i.toString()}>
                {label}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <span
            onDoubleClick={() => {
              setEditingCell({ rowId: row.original.id, colId: column.id });
              setEditValue(row.original.result?.toString() ?? "0");
            }}
            style={{ cursor: "pointer" }}
          >
            {resultLabels[lang][row.original.result]}
          </span>
        ),
    },
    {
      accessorKey: "currency",
      header: "Currency",
      cell: ({ row, column }) =>
        editingCell &&
        editingCell.rowId === row.original.id &&
        editingCell.colId === column.id ? (
          <TextField
            value={editValue}
            size="small"
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={async () => {
              await handleEdit(row.original, column.id as keyof Bet, editValue);
              setEditingCell(null);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await handleEdit(
                  row.original,
                  column.id as keyof Bet,
                  editValue
                );
                setEditingCell(null);
              }
            }}
            autoFocus
          />
        ) : (
          <span
            onDoubleClick={() => {
              setEditingCell({ rowId: row.original.id, colId: column.id });
              setEditValue(row.original.currency || "");
            }}
            style={{ cursor: "pointer" }}
          >
            {row.original.currency || "[leer]"}
          </span>
        ),
    },
    {
      accessorKey: "kind",
      header: lang === "de" ? "Typ" : "Kind",
      cell: ({ row, column }) =>
        editingCell &&
        editingCell.rowId === row.original.id &&
        editingCell.colId === column.id ? (
          <Select
            value={editValue}
            size="small"
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={async () => {
              await handleEdit(row.original, column.id as keyof Bet, editValue);
              setEditingCell(null);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await handleEdit(
                  row.original,
                  column.id as keyof Bet,
                  editValue
                );
                setEditingCell(null);
              }
            }}
            autoFocus
            sx={{ minWidth: 110 }}
          >
            {typeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <span
            onDoubleClick={() => {
              setEditingCell({ rowId: row.original.id, colId: column.id });
              setEditValue(row.original.kind ?? "Single");
            }}
            style={{ cursor: "pointer" }}
          >
            {row.original.kind}
          </span>
        ),
    },
    {
      id: "ggr",
      header: "GGR",
      cell: ({ row }) => {
        const bet = row.original;
        const channel = channels.find((ch) => ch.id === bet.channelId);
        const type = channel?.type || "Provider"; // Default: Provider, falls Feld fehlt

        // GGR-Berechnung:
        let ggr = 0;
        switch (bet.result) {
          case 0: // Verloren
            ggr = type === "Provider" ? -bet.stake : bet.stake;
            break;
          case 1: // Gewonnen
            ggr =
              type === "Provider"
                ? bet.stake * (bet.odds - 1)
                : -bet.stake * (bet.odds - 1);
            break;
          case 2: // Verloren (Einsatz zurück)
            ggr = type === "Provider" ? -bet.stake / 2 : bet.stake / 2;
            break;
          case 3: // Gewonnen (Einsatz zurück)
            ggr =
              type === "Provider"
                ? (bet.stake / 2) * (bet.odds - 1)
                : -(bet.stake / 2) * (bet.odds - 1);
            break;
          case 4: // Push
          case 5: // Offen
            ggr = 0;
            break;
          default:
            ggr = 0;
        }
        // Optional: 2 Nachkommastellen, Währung anzeigen
        return ggr.toFixed(2) + " " + bet.currency;
      },
    },
  ];
}
