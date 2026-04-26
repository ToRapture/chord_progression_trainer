import { useCallback, useMemo, useState } from "react";
import {
  MAJOR_KEYS,
  MINOR_KEYS,
  getDefaultVocabulary,
} from "../../core/harmony/keys";
import type {
  KeySignature,
  Mode,
  RomanNumeral,
} from "../../core/harmony/types";
import { generateExercise } from "../../core/exercises/generateExercise";
import { scoreAnswer } from "../../core/exercises/scoring";
import type {
  Exercise,
  ExerciseGenerationOptions,
  ExerciseType,
} from "../../core/exercises/types";
import {
  PROGRESSION_GROUPS,
  type ProgressionGroupId,
} from "../../core/progressions";
import { voiceProgression } from "../../core/voicing";
import type { InstrumentPresetId } from "../../core/voicing/types";
import { scheduleEvents } from "../../core/playback/scheduler";
import * as toneEngine from "../../core/playback/toneEngine";
import * as midiEngine from "../../core/playback/midiEngine";
import { ChordStrip } from "../components/ChordStrip";

type Output = "audio" | "midi";

const EXERCISE_TYPES: { id: ExerciseType; label: string }[] = [
  { id: "identify_progression", label: "Identify progression" },
  { id: "fill_missing_chord", label: "Fill missing chord" },
  { id: "detect_replacement", label: "Detect replacement" },
];

const PRESETS: { id: InstrumentPresetId; label: string }[] = [
  { id: "piano_clear", label: "Piano (clear)" },
  { id: "piano_smooth", label: "Piano (smooth)" },
  { id: "guitar_open", label: "Guitar (open)" },
  { id: "strings_quartet_basic", label: "String quartet" },
];

const GROUPS: { id: ProgressionGroupId; label: string }[] = [
  { id: "all", label: "All" },
  ...(Object.keys(PROGRESSION_GROUPS) as (keyof typeof PROGRESSION_GROUPS)[])
    .map((g) => ({ id: g, label: g })),
];

export function TrainerPage() {
  const [mode, setMode] = useState<Mode>("major");
  const [tonic, setTonic] = useState<string>("C");
  const [exerciseType, setExerciseType] =
    useState<ExerciseType>("identify_progression");
  const [groupId, setGroupId] = useState<ProgressionGroupId>("all");
  const [preset, setPreset] = useState<InstrumentPresetId>("piano_clear");
  const [tempo, setTempo] = useState<number>(100);
  const [output, setOutput] = useState<Output>("audio");
  const [midiOutputs, setMidiOutputs] = useState<{ id: string; name: string }[]>([]);
  const [midiOutputId, setMidiOutputId] = useState<string>("");
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [reveal, setReveal] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");

  const key: KeySignature = useMemo(() => ({ tonic, mode }), [tonic, mode]);

  const allowedRomans = useMemo(() => getDefaultVocabulary(mode), [mode]);

  const newExercise = useCallback(() => {
    const opts: ExerciseGenerationOptions = {
      key,
      allowedRomans,
      exerciseType,
      difficultyRange: [1, 5],
      groupId,
      instrumentPreset: preset,
      choiceCount: 4,
    };
    const ex = generateExercise(opts);
    setExercise(ex);
    setPickedId(null);
    setReveal(false);
    setStatus(ex ? "" : "No matching progression for current options.");
  }, [allowedRomans, exerciseType, groupId, key, preset]);

  const stop = useCallback(() => {
    toneEngine.stop();
    midiEngine.stop();
  }, []);

  const playRomans = useCallback(
    async (romans: RomanNumeral[]) => {
      if (!exercise || !romans.length) return;
      stop();
      setBusy(true);
      setStatus("Loading samples...");
      try {
        const voiced = voiceProgression({
          key: exercise.key,
          progression: romans,
          instrumentPreset: preset,
        });
        const events = scheduleEvents(voiced, {
          tempoBpm: tempo,
          beatsPerChord: 4,
        });
        if (output === "midi") {
          await midiEngine.playEvents(events, preset);
        } else {
          await toneEngine.playEvents(events, preset);
        }
        setStatus("Playing.");
      } catch (e) {
        setStatus(`Playback error: ${(e as Error).message}`);
      } finally {
        setBusy(false);
      }
    },
    [exercise, preset, tempo, output, stop],
  );

  const play = useCallback(() => {
    if (!exercise) return;
    void playRomans(exercise.originalProgression);
  }, [exercise, playRomans]);

  const pick = useCallback(
    (choiceId: string) => {
      if (!exercise || reveal) return;
      setPickedId(choiceId);
      const result = scoreAnswer(exercise, choiceId);
      setReveal(true);
      setStatus(result.correct ? "Correct!" : "Not quite.");
    },
    [exercise, reveal],
  );

  const enableMidi = useCallback(async () => {
    setStatus("Requesting MIDI access...");
    try {
      await midiEngine.requestMidiAccess();
      const outs = midiEngine
        .getMidiOutputs()
        .map((o) => ({ id: o.id, name: o.name ?? o.id }));
      setMidiOutputs(outs);
      if (outs.length) {
        setMidiOutputId(outs[0].id);
        midiEngine.setMidiOutput(outs[0].id);
      }
      setStatus(`Found ${outs.length} MIDI output(s).`);
    } catch (e) {
      setStatus(`MIDI error: ${(e as Error).message}`);
    }
  }, []);

  const keyOptions = mode === "major" ? MAJOR_KEYS : MINOR_KEYS;

  return (
    <>
      <section className="panel">
        <h2>Settings</h2>
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
              {keyOptions.map((k) => (
                <option key={k} value={k}>
                  {k} {mode}
                </option>
              ))}
            </select>
          </div>
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
            <label>Exercise</label>
            <select
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value as ExerciseType)}
            >
              {EXERCISE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Preset</label>
            <select
              value={preset}
              onChange={(e) =>
                setPreset(e.target.value as InstrumentPresetId)
              }
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
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
            <label>Output</label>
            <select
              value={output}
              onChange={(e) => setOutput(e.target.value as Output)}
            >
              <option value="audio">Web Audio</option>
              <option value="midi">Web MIDI</option>
            </select>
          </div>
          {output === "midi" && (
            <>
              <div className="field">
                <label>MIDI Output</label>
                <select
                  value={midiOutputId}
                  onChange={(e) => {
                    setMidiOutputId(e.target.value);
                    midiEngine.setMidiOutput(e.target.value);
                  }}
                >
                  {midiOutputs.length === 0 && (
                    <option value="">No outputs</option>
                  )}
                  {midiOutputs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>&nbsp;</label>
                <button onClick={enableMidi}>Enable MIDI</button>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="panel">
        <h2>Exercise</h2>
        <div className="row">
          <button className="primary" onClick={newExercise}>
            New exercise
          </button>
          <button onClick={play} disabled={!exercise || busy}>
            Play
          </button>
          <button onClick={stop}>Stop</button>
          <button onClick={() => setReveal(true)} disabled={!exercise || reveal}>
            Reveal
          </button>
        </div>

        {exercise && (
          <>
            <div style={{ marginTop: 16 }}>
              <ExerciseDisplay
                exercise={exercise}
                reveal={reveal}
                pickedId={pickedId}
                onPick={pick}
                onPlayChoice={(romans) => void playRomans(romans)}
              />
            </div>
            {reveal && (
              <div
                className={`feedback ${
                  pickedId && exercise.answerId === pickedId ? "good" : "bad"
                }`}
              >
                {exercise.explanation}
              </div>
            )}
          </>
        )}

        {status && (
          <div className="muted-text" style={{ marginTop: 8 }}>
            {status}
          </div>
        )}
      </section>
    </>
  );
}

function ExerciseDisplay({
  exercise,
  reveal,
  pickedId,
  onPick,
  onPlayChoice,
}: {
  exercise: Exercise;
  reveal: boolean;
  pickedId: string | null;
  onPick: (id: string) => void;
  onPlayChoice: (romans: RomanNumeral[]) => void;
}) {
  const display = useMemo(() => {
    if (exercise.type === "fill_missing_chord" && exercise.promptProgression) {
      return exercise.promptProgression.map((r) => ({
        label: r ?? "?",
        target: r === null,
      }));
    }
    if (
      exercise.type === "detect_replacement" &&
      exercise.targetIndex !== undefined
    ) {
      return exercise.originalProgression.map((r, i) => ({
        label: reveal ? r : "?",
        target: reveal && i === exercise.targetIndex,
      }));
    }
    return exercise.originalProgression.map((r) => ({
      label: reveal ? r : "?",
      target: false,
    }));
  }, [exercise, reveal]);

  return (
    <>
      <div className="muted-text" style={{ marginBottom: 8 }}>
        {exercise.key.tonic} {exercise.key.mode} ·{" "}
        {exercise.type.replace(/_/g, " ")} · difficulty{" "}
        <span className={`diff-${exercise.metadata.difficulty}`}>
          {exercise.metadata.difficulty}
        </span>
      </div>
      <ChordStrip cells={display} />
      <div className="choices" style={{ marginTop: 16 }}>
        {exercise.choices.map((c) => {
          let cls = "choice-btn";
          if (reveal) {
            if (c.id === exercise.answerId) cls += " correct";
            else if (c.id === pickedId) cls += " wrong";
          }
          const handleClick = () => {
            if (reveal) {
              if (c.roman && c.roman.length) onPlayChoice(c.roman);
            } else {
              onPick(c.id);
            }
          };
          const title = reveal && c.roman?.length ? "Click to play" : undefined;
          return (
            <button
              key={c.id}
              className={cls}
              onClick={handleClick}
              title={title}
            >
              {c.label}
              {reveal && c.roman && c.roman.length > 0 && (
                <span style={{ marginLeft: 8, opacity: 0.7 }}>▶</span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
