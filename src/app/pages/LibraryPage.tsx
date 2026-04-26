import { useMemo, useState } from "react";
import {
  PROGRESSION_GROUPS,
  getAllProgressions,
  getProgressionsByGroup,
  type ProgressionGroupId,
} from "../../core/progressions";
import type { ProgressionTemplate } from "../../core/progressions";
import { romanProgressionToChordSymbols } from "../../core/harmony/chordSymbols";
import { voiceProgression } from "../../core/voicing";
import { scheduleEvents } from "../../core/playback/scheduler";
import * as toneEngine from "../../core/playback/toneEngine";
import type { KeySignature } from "../../core/harmony/types";
import { MAJOR_KEYS } from "../../core/harmony/keys";

const GROUPS: { id: ProgressionGroupId; label: string }[] = [
  { id: "all", label: "All" },
  ...(Object.keys(PROGRESSION_GROUPS) as (keyof typeof PROGRESSION_GROUPS)[])
    .map((g) => ({ id: g, label: g })),
];

export function LibraryPage() {
  const [groupId, setGroupId] = useState<ProgressionGroupId>("all");
  const [filter, setFilter] = useState<string>("");
  const [tonic, setTonic] = useState<string>("C");
  const [tempo, setTempo] = useState<number>(100);
  const [status, setStatus] = useState<string>("");

  const items = useMemo(() => {
    const list = getProgressionsByGroup(groupId);
    if (!filter.trim()) return list;
    const q = filter.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q)) ||
        p.roman.join(" ").toLowerCase().includes(q),
    );
  }, [groupId, filter]);

  const total = useMemo(() => getAllProgressions().length, []);

  const playOne = async (tpl: ProgressionTemplate) => {
    toneEngine.stop();
    setStatus(`Playing ${tpl.name}...`);
    try {
      const mode = tpl.mode === "minor" ? "minor" : "major";
      const key: KeySignature = { tonic, mode };
      const voiced = voiceProgression({
        key,
        progression: tpl.roman,
        instrumentPreset: "piano_clear",
      });
      const events = scheduleEvents(voiced, { tempoBpm: tempo });
      await toneEngine.playEvents(events, "piano_clear");
      setStatus(`Played ${tpl.name}.`);
    } catch (e) {
      setStatus(`Playback error: ${(e as Error).message}`);
    }
  };

  return (
    <>
      <section className="panel">
        <h2>Library ({total} progressions)</h2>
        <div className="row">
          <div className="field">
            <label>Group</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value as ProgressionGroupId)}
            >
              {GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Search</label>
            <input
              type="text"
              value={filter}
              placeholder="name / tag / roman"
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Preview key</label>
            <select value={tonic} onChange={(e) => setTonic(e.target.value)}>
              {MAJOR_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Tempo</label>
            <input
              type="number"
              min={40}
              max={220}
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value) || 100)}
            />
          </div>
          <div className="field">
            <label>&nbsp;</label>
            <button onClick={() => toneEngine.stop()}>Stop</button>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Showing {items.length}</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Mode</th>
              <th>Roman</th>
              <th>Symbols (in {tonic})</th>
              <th>Diff</th>
              <th>Tags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const mode = p.mode === "minor" ? "minor" : "major";
              const symbols = romanProgressionToChordSymbols(p.roman, {
                tonic,
                mode,
              });
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.mode}</td>
                  <td><code>{p.roman.join(" - ")}</code></td>
                  <td><code>{symbols.join(" - ")}</code></td>
                  <td>
                    <span className={`diff-${p.difficulty}`}>{p.difficulty}</span>
                  </td>
                  <td>
                    {p.tags.map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </td>
                  <td>
                    <button onClick={() => playOne(p)}>Play</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {status && <div className="muted-text" style={{ marginTop: 8 }}>{status}</div>}
      </section>
    </>
  );
}
