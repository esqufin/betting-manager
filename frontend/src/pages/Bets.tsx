import React, { useEffect, useMemo, useState } from "react";
import {
  Stack,
  Select,
  MenuItem,
  Box,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import { fetchBets, createBet, updateBet, deleteBet } from "../api/bets";
import { fetchChannels } from "../api/channels";
import AddBetForm from "./AddBetForm";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { MultiEntryInput } from "./AddBetForm";
import type { Bet, Channel } from "../types/betting";
import { getBetsColumns } from "./betsColumns";

function emptyEntry(date: string): MultiEntryInput {
  return {
    match: "",
    odds: "",
    betType: "",
    pick: "",
    date,
  };
}

export default function Bets() {
  const [data, setData] = useState<Bet[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [editingCell, setEditingCell] = useState<{
    rowId: number;
    colId: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<"de" | "en">("de");

  const [selectedChannelId, setSelectedChannelId] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const [newBet, setNewBet] = useState<Omit<Bet, "id">>({
    date: new Date().toISOString(),
    channelId: 0,
    match: "",
    stake: 0,
    odds: 0,
    betType: "",
    pick: "",
    result: 0,
    currency: "USD",
    kind: "Single",
  });
  const [type, setType] = useState<"Single" | "Multi">("Single");
  const [multiEntries, setMultiEntries] = useState<MultiEntryInput[]>([
    emptyEntry(selectedDate + "T12:00:00.000Z"),
  ]);

  // Lade Daten
  useEffect(() => {
    setLoading(true);
    fetchBets()
      .then(setData)
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Lade Channels
  useEffect(() => {
    fetchChannels()
      .then((chs) => {
        setChannels(chs);
        if (chs.length) {
          setSelectedChannelId((prev) => prev || chs[0].id);
          setNewBet((prev) => ({
            ...prev,
            channelId: chs[0].id,
            date: selectedDate + "T12:00:00.000Z",
          }));
        }
      })
      .catch((err) => alert(err.message));
    // eslint-disable-next-line
  }, []);

  // Aktualisiere Wettschein, wenn Channel oder Datum sich ändert
  useEffect(() => {
    setNewBet((prev) => ({
      ...prev,
      channelId: selectedChannelId,
      date: selectedDate + "T12:00:00.000Z",
    }));
  }, [selectedChannelId, selectedDate]);

  function parseValue(field: keyof Bet, value: string): string | number {
    if (["stake", "odds", "result", "channelId"].includes(field)) {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    }
    return value;
  }

  const filteredBets = useMemo(() => {
    return data.filter(
      (bet) =>
        bet.channelId === selectedChannelId &&
        bet.date.slice(0, 10) === selectedDate
    );
  }, [data, selectedChannelId, selectedDate]);

  // "Hack": wrappe handleEdit als synchron, da getBetsColumns void erwartet
  const handleEditVoid = (bet: Bet, field: keyof Bet, value: any) => {
    handleEdit(bet, field, value);
  };

  const columns = useMemo(
    () =>
      getBetsColumns(
        lang,
        channels,
        editingCell,
        editValue,
        setEditingCell,
        setEditValue,
        handleEditVoid,
        parseValue
      ),
    [lang, channels, editingCell, editValue]
  );

  async function handleEdit(bet: Bet, field: keyof Bet, value: any) {
    const updatedBet = { ...bet, [field]: value };
    try {
      const updated = await updateBet(updatedBet);
      setData((old) =>
        old.map((row) => (row.id === updated.id ? updated : row))
      );
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDelete() {
    const selectedIds = Object.keys(rowSelection)
      .filter((id) => rowSelection[Number(id)])
      .map(Number);
    for (const id of selectedIds) {
      try {
        await deleteBet(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
    setData((old) => old.filter((row) => !selectedIds.includes(row.id)));
    setRowSelection({});
  }

  async function handleAdd() {
    if (!newBet.channelId) {
      alert("Bitte einen Channel auswählen!");
      return;
    }
    try {
      const created = await createBet(newBet);
      setData((old) => [...old, created]);
      setMultiEntries([emptyEntry(selectedDate + "T12:00:00.000Z")]);
      setNewBet({
        date: selectedDate + "T12:00:00.000Z",
        channelId: selectedChannelId,
        match: "",
        stake: 0,
        odds: 0,
        betType: "",
        pick: "",
        result: 0,
        currency: "USD",
        kind: "Single",
      });
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Table-Initialisierung
  const table = useReactTable({
    data: filteredBets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id.toString(),
  });

  return (
    <div style={{ width: "100%", marginTop: 20 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button onClick={() => setLang("de")}>Deutsch</Button>
        <Button onClick={() => setLang("en")}>English</Button>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Select
          value={selectedChannelId}
          onChange={(e) => setSelectedChannelId(Number(e.target.value))}
          size="small"
          sx={{ minWidth: 150 }}
        >
          {channels.map((ch) => (
            <MenuItem key={ch.id} value={ch.id}>
              {ch.name}
            </MenuItem>
          ))}
        </Select>
        <TextField
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          size="small"
          label={lang === "de" ? "Datum" : "Date"}
          sx={{ width: 160 }}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2, mb: 2 }}>
        <AddBetForm
          lang={lang}
          type={type}
          setType={setType}
          newBet={newBet}
          setNewBet={setNewBet}
          multiEntries={multiEntries}
          setMultiEntries={setMultiEntries}
          loading={loading}
          onAdd={handleAdd}
        />
      </Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
          disabled={
            Object.keys(rowSelection).filter((id) => rowSelection[Number(id)])
              .length === 0 || loading
          }
        >
          {lang === "de"
            ? "Ausgewählten Wettschein löschen"
            : "Delete Selected Bet"}
        </Button>
        {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
      </Stack>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: 8,
                    background: "#f5f5f5",
                    textAlign: "left",
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: 8,
                    background:
                      editingCell && editingCell.rowId === row.original.id
                        ? "#fffbe6"
                        : "#fff",
                    minWidth: 80,
                    maxWidth: 180,
                    overflowWrap: "break-word",
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
