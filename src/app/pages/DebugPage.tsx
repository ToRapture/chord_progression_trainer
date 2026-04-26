import { useMemo, useState } from "react";
import {
  MAJOR_KEYS,
  getDefaultVocabulary,
} from "../../core/harmony/keys";
import type { KeySignature, Mode } from "../../core/harmony/types";
import { romanProgressionToChordSymbols } from "../../core/harmony/chordSymbols";
import { getFunctionGroupsForProgression } from "../../core/harmony/functionGroups";
import { validateProgressionAgainstOptions } from "../../core/harmony/validateProgression";
import { voiceProgression } from "../../core/voicing";
import type { InstrumentPresetId } from "../../core/voicing/types";
import { scheduleEvents } from "../../core/playback/scheduler";
import * as toneEngine from "../../core/playback/toneEngine";

const MIDI_NAMES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
];

function midiToName(m: number): string {
  const oct = Math.floor(m / 12) - 1;
  return `${MIDI_NAMES[m % 12]}${oct}`;
}

const PRESETS: InstrumentPresetId[] = [
  "piano_clear",
  "piano_smooth",
  "guitar_open",
  "strings_quartet_basic",
];

export function DebugPage() {
  const [mode, setMode] = useState<Mode>("major");
  const [tonic, setTonic] = useState<string>("C");
  const [romanText, setRomanText] = useState<string>("I vi IV V");
  const [preset, setPreset] = useState<InstrumentPresetId>("piano_clear");
  const [tempo, setTempo] = useState<number>(100);
  const [status, setStatus] = useState<string>("");

  const key: KeySignature = useMemo(() => ({ tonic, mode }), [tonic, mode]);

  const tokens = useMemo(
    () => romanText.trim().split(/\s+/).filter(Boolean),
    [romanText],
  );

  const validation = useMemo(() => {
    if (!tokens.length) return { ok: true as const, errors: [] };
    const r = validateProgressionAgainstOptions(tokens, {
      mode,
      allowedRomans: getDefaultVocabulary(mode),
    });
    return r.ok ? { ok: true as const, errors: [] } : { ok: false as const, errors: r.errors };
  }, [tokens, mode]);

  const symbols = useMemo(() => {
    if (!tokens.length) return [];
    try {
      return romanProgressionToChordSymbols(tokens, key);
    } catch {
      return [];
    }
  }, [tokens, key]);

  const fns = useMemo(() => {
    if (!tokens.length) return [];
    try {
      return getFunctionGroupsForProgression(tokens, mode);
    } catch {
      return [];
    }
  }, [tokens, mode]);

  const voiced = useMemo(() => {
    if (!tokens.length || !validation.ok) return [];
    try {
      return voiceProgression({
        key,
        progression: tokens,
        instrumentPreset: preset,
      });
    } catch {
      return [];
    }
  }, [tokens, validation, key, preset]);

  const play = async () => {
    if (!voiced.length) return;
    toneEngine.stop();
    setStatus("Loading samples...");
    try {
      const events = scheduleEvents(voiced, { tempoBpm: tempo });
      await toneEngine.playEvents(events, preset);
      setStatus("Playing.");
    } catch (e) {
      setStatus(`Error: ${(e as Error).message}`);
    }
  };

  return (
    <>
      <section className="panel">
        <h2>Voicing Debug</h2>
        <div className="row">
          <div className="field">
            <label>Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
            </select>
          </div>
          <div className="field">
            <label>Key</label>
            <select value={tonic} onChange={(e) => setTonic(e.target.value)}>
              {MAJOR_KEYS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 240 }}>
            <label>Roman numerals (space-separated)</label>
            <input
              type="text"
              value={romanText}
              onChange={(e) => setRomanText(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Preset</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as InstrumentPresetId)}
            >
              {PRESETS.map((p) => (
                <option key={p} value={p}>{p}</option>
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
            <button className="primary" onClick={play} disabled={!voiced.length}>
              Play
            </button>
          </div>
          <div className="field">
            <label>&nbsp;</label>
            <button onClick={() => toneEngine.stop()}>Stop</button>
          </div>
        </div>
        {!validation.ok && (
          <div className="feedback bad" style={{ marginTop: 8 }}>
            {validation.errors.join("; ")}
          </div>
        )}
        {status && <div className="muted-text" style={{ marginTop: 8 }}>{status}</div>}
      </section>

      <section className="panel">
        <h2>Voiced chords</h2>
        {voiced.length === 0 ? (
          <div className="muted-text">No voiced chords (check input).</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Roman</th>
                <th>Function</th>
                <th>Symbol</th>
                <th>Bass</th>
                <th>Upper voices</th>
                <th>MIDI</th>
              </tr>
            </thead>
            <tbody>
              {voiced.map((v, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><code>{v.roman}</code></td>
                  <td>{fns[i] ?? "?"}</td>
                  <td><code>{v.chordSymbol}</code></td>
                  <td className="notes-list">
                    {midiToName(v.bass)} ({v.bass})
                  </td>
                  <td className="notes-list">
                    {v.upperVoices.map(midiToName).join(" ")}
                  </td>
                  <td className="notes-list">[{v.allNotes.join(", ")}]</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="panel">
        <h2>Resolved symbols</h2>
        <div className="notes-list">
          {symbols.length ? symbols.join("  -  ") : "(empty)"}
        </div>
      </section>
    </>
  );
}
