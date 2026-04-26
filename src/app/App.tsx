import { useCallback, useMemo, useState } from "react";
import { defaultVocabularyForMode, getSupportedKeys } from "../core/harmony/keys";
import type { KeySignature, Mode, RomanNumeral } from "../core/harmony/types";
import { instrumentPresets } from "../core/instruments";
import { midiEngine } from "../core/playback/midiEngine";
import { scheduleVoicedProgression } from "../core/playback/scheduler";
import { toneEngine } from "../core/playback/toneEngine";
import { progressionLibrary } from "../core/progressions";
import type { ProgressionGroupId } from "../core/progressions/types";
import { generateVoicedProgression } from "../core/voicing";
import type { InstrumentEvent, InstrumentPresetId, VoicedChord } from "../core/voicing/types";
import { generateExercise } from "../core/exercises/generateExercise";
import { scoreExercise } from "../core/exercises/scoring";
import type { Exercise, ExerciseType } from "../core/exercises/types";

type Page = "trainer" | "library" | "debug";
type SoundEngine = "sampler" | "midi";
type Feedback = { correct: boolean; explanation: string } | null;

const exerciseTypes: { id: ExerciseType; label: string }[] = [
  { id: "identify_progression", label: "Identify Progression" },
  { id: "fill_missing_chord", label: "Fill Missing Chord" },
  { id: "detect_replacement", label: "Detect Replacement" },
  { id: "identify_function", label: "Identify Function" },
  { id: "identify_bass_degrees", label: "Identify Bass Degrees" },
];

const progressionGroups: { id: ProgressionGroupId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "majorBasic", label: "Major Basic" },
  { id: "minorBasic", label: "Minor Basic" },
  { id: "pop", label: "Pop" },
  { id: "jazzBasic", label: "Jazz Basic" },
];

export default function App() {
  const [page, setPage] = useState<Page>("trainer");
  const [mode, setMode] = useState<Mode>("major");
  const [key, setKey] = useState<KeySignature>({ tonic: "C", mode: "major" });
  const [exerciseType, setExerciseType] = useState<ExerciseType>("identify_progression");
  const [presetId, setPresetId] = useState<InstrumentPresetId>("piano_clear");
  const [progressionGroup, setProgressionGroup] = useState<ProgressionGroupId>("all");
  const [difficultyMin, setDifficultyMin] = useState(1);
  const [difficultyMax, setDifficultyMax] = useState(3);
  const [tempo, setTempo] = useState(84);
  const [choiceCount, setChoiceCount] = useState(4);
  const [showRoman, setShowRoman] = useState(true);
  const [allowedRomans, setAllowedRomans] = useState<RomanNumeral[]>(defaultVocabularyForMode("major"));
  const [soundEngine, setSoundEngine] = useState<SoundEngine>("sampler");
  const [midiOutputs, setMidiOutputs] = useState<{ id: string; name?: string }[]>([]);
  const [midiOutputId, setMidiOutputId] = useState<string | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [voicedChords, setVoicedChords] = useState<VoicedChord[]>([]);
  const [events, setEvents] = useState<InstrumentEvent[]>([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keys = useMemo(() => getSupportedKeys(mode), [mode]);
  const eng = soundEngine === "midi" ? midiEngine : toneEngine;

  const handleModeChange = useCallback((nextMode: Mode) => {
    setMode(nextMode);
    setKey({ tonic: "C", mode: nextMode });
    setAllowedRomans(defaultVocabularyForMode(nextMode));
    setProgressionGroup(nextMode === "minor" ? "minorBasic" : "all");
  }, []);

  const rebuildRuntime = useCallback((nextExercise: Exercise) => {
    const progressionToPlay = nextExercise.playedProgression ?? nextExercise.originalProgression;
    const nextVoiced = generateVoicedProgression({ key: nextExercise.key, progression: progressionToPlay, instrumentPreset: presetId });
    const nextEvents = scheduleVoicedProgression(nextVoiced, { beatsPerChord: 4, bpm: tempo, presetId });
    setVoicedChords(nextVoiced);
    setEvents(nextEvents);
  }, [presetId, tempo]);

  const handleGenerateExercise = useCallback(() => {
    setError(null);
    try {
      const nextExercise = generateExercise({
        key,
        allowedRomans,
        exerciseType,
        difficultyRange: [Math.min(difficultyMin, difficultyMax), Math.max(difficultyMin, difficultyMax)],
        instrumentPreset: presetId,
        choiceCount,
        progressionGroup,
      });
      setExercise(nextExercise);
      rebuildRuntime(nextExercise);
      setSelectedChoiceId(null);
      setFeedback(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [allowedRomans, choiceCount, difficultyMax, difficultyMin, exerciseType, key, presetId, progressionGroup, rebuildRuntime]);

  const handlePlay = useCallback(async () => {
    if (!events.length) return;
    setError(null);
    setIsPlaying(true);
    try {
      eng.stop();
      await eng.playEvents(events);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsPlaying(false);
    }
  }, [eng, events, presetId]);

  const handleStop = useCallback(() => {
    eng.stop();
    setIsPlaying(false);
  }, [eng]);

  const handlePlayChord = useCallback(async (index: number) => {
    if (!showRoman || !voicedChords[index]) return;
    setError(null);
    try {
      eng.stop();
      await eng.playChord(voicedChords[index].allNotes, 1.8, presetId, 0.75);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [eng, presetId, showRoman, voicedChords]);

  const handleSubmitAnswer = useCallback(() => {
    if (!exercise || !selectedChoiceId) return;
    const result = scoreExercise(exercise, selectedChoiceId);
    setFeedback(result);
    setScore((current) => ({ correct: current.correct + (result.correct ? 1 : 0), total: current.total + 1 }));
  }, [exercise, selectedChoiceId]);

  const handleSoundEngineChange = useCallback(async (next: SoundEngine) => {
    setSoundEngine(next);
    setError(null);
    if (next === "midi") {
      try {
        await midiEngine.requestMidiAccess();
        const outputs = midiEngine.getMidiOutputs().map((output) => ({ id: output.id, name: output.name }));
        setMidiOutputs(outputs);
        if (outputs[0]) {
          setMidiOutputId(outputs[0].id);
          midiEngine.setMidiOutput(outputs[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Chord Progression Trainer</h1>
          <p>Roman numeral ear training with functional feedback and clear voicing.</p>
        </div>
        <nav>
          {(["trainer", "library", "debug"] as Page[]).map((item) => (
            <button key={item} className={page === item ? "active" : ""} onClick={() => setPage(item)}>
              {item}
            </button>
          ))}
        </nav>
      </header>

      {page === "trainer" && (
        <TrainerPage
          mode={mode}
          keySignature={key}
          keys={keys}
          exerciseType={exerciseType}
          presetId={presetId}
          progressionGroup={progressionGroup}
          difficultyMin={difficultyMin}
          difficultyMax={difficultyMax}
          tempo={tempo}
          choiceCount={choiceCount}
          showRoman={showRoman}
          soundEngine={soundEngine}
          midiOutputs={midiOutputs}
          midiOutputId={midiOutputId}
          exercise={exercise}
          voicedChords={voicedChords}
          selectedChoiceId={selectedChoiceId}
          feedback={feedback}
          score={score}
          isPlaying={isPlaying}
          error={error}
          onModeChange={handleModeChange}
          onKeyChange={setKey}
          onExerciseTypeChange={setExerciseType}
          onPresetChange={setPresetId}
          onProgressionGroupChange={setProgressionGroup}
          onDifficultyMinChange={setDifficultyMin}
          onDifficultyMaxChange={setDifficultyMax}
          onTempoChange={setTempo}
          onChoiceCountChange={setChoiceCount}
          onShowRomanChange={setShowRoman}
          onSoundEngineChange={handleSoundEngineChange}
          onMidiOutputChange={(id) => {
            setMidiOutputId(id);
            midiEngine.setMidiOutput(id);
          }}
          onGenerate={handleGenerateExercise}
          onPlay={handlePlay}
          onStop={handleStop}
          onPlayChord={handlePlayChord}
          onSelectChoice={setSelectedChoiceId}
          onSubmit={handleSubmitAnswer}
        />
      )}
      {page === "library" && <LibraryPage />}
      {page === "debug" && <DebugPage exercise={exercise} voicedChords={voicedChords} events={events} />}
    </div>
  );
}

type TrainerProps = {
  mode: Mode;
  keySignature: KeySignature;
  keys: KeySignature[];
  exerciseType: ExerciseType;
  presetId: InstrumentPresetId;
  progressionGroup: ProgressionGroupId;
  difficultyMin: number;
  difficultyMax: number;
  tempo: number;
  choiceCount: number;
  showRoman: boolean;
  soundEngine: SoundEngine;
  midiOutputs: { id: string; name?: string }[];
  midiOutputId: string | null;
  exercise: Exercise | null;
  voicedChords: VoicedChord[];
  selectedChoiceId: string | null;
  feedback: Feedback;
  score: { correct: number; total: number };
  isPlaying: boolean;
  error: string | null;
  onModeChange: (mode: Mode) => void;
  onKeyChange: (key: KeySignature) => void;
  onExerciseTypeChange: (type: ExerciseType) => void;
  onPresetChange: (id: InstrumentPresetId) => void;
  onProgressionGroupChange: (id: ProgressionGroupId) => void;
  onDifficultyMinChange: (value: number) => void;
  onDifficultyMaxChange: (value: number) => void;
  onTempoChange: (value: number) => void;
  onChoiceCountChange: (value: number) => void;
  onShowRomanChange: (value: boolean) => void;
  onSoundEngineChange: (value: SoundEngine) => void;
  onMidiOutputChange: (id: string) => void;
  onGenerate: () => void;
  onPlay: () => void;
  onStop: () => void;
  onPlayChord: (index: number) => void;
  onSelectChoice: (id: string) => void;
  onSubmit: () => void;
};

function TrainerPage(props: TrainerProps) {
  const accuracy = props.score.total ? Math.round((props.score.correct / props.score.total) * 100) : 0;
  return (
    <main className="layout">
      <section className="settings-panel">
        <h2>Settings</h2>
        <label>Mode<select value={props.mode} onChange={(event) => props.onModeChange(event.target.value as Mode)}><option value="major">Major</option><option value="minor">Minor</option></select></label>
        <label>Key<select value={props.keySignature.tonic} onChange={(event) => props.onKeyChange({ tonic: event.target.value, mode: props.mode })}>{props.keys.map((key) => <option key={`${key.tonic}-${key.mode}`} value={key.tonic}>{key.tonic} {key.mode}</option>)}</select></label>
        <label>Exercise Type<select value={props.exerciseType} onChange={(event) => props.onExerciseTypeChange(event.target.value as ExerciseType)}>{exerciseTypes.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}</select></label>
        <label>Instrument<select value={props.presetId} onChange={(event) => props.onPresetChange(event.target.value as InstrumentPresetId)}>{instrumentPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}</select></label>
        <label>Sound Engine<select value={props.soundEngine} onChange={(event) => props.onSoundEngineChange(event.target.value as SoundEngine)}><option value="sampler">Sampler (Piano)</option><option value="midi">MIDI Output</option></select></label>
        {props.soundEngine === "midi" && <label>MIDI Port<select value={props.midiOutputId ?? ""} onChange={(event) => props.onMidiOutputChange(event.target.value)}>{props.midiOutputs.map((output) => <option key={output.id} value={output.id}>{output.name ?? output.id}</option>)}</select></label>}
        <label>Group<select value={props.progressionGroup} onChange={(event) => props.onProgressionGroupChange(event.target.value as ProgressionGroupId)}>{progressionGroups.map((group) => <option key={group.id} value={group.id}>{group.label}</option>)}</select></label>
        <div className="two-col"><label>Difficulty Min<input type="number" min="1" max="5" value={props.difficultyMin} onChange={(event) => props.onDifficultyMinChange(Number(event.target.value))} /></label><label>Difficulty Max<input type="number" min="1" max="5" value={props.difficultyMax} onChange={(event) => props.onDifficultyMaxChange(Number(event.target.value))} /></label></div>
        <label>Tempo (BPM)<input type="range" min="40" max="240" value={props.tempo} onChange={(event) => props.onTempoChange(Number(event.target.value))} /><span>{props.tempo}</span></label>
        <label>Choices<input type="number" min="2" max="8" value={props.choiceCount} onChange={(event) => props.onChoiceCountChange(Number(event.target.value))} /></label>
        <button className="primary" onClick={props.onGenerate}>Generate Exercise</button>
      </section>

      <section className="exercise-panel">
        <div className="panel-heading">
          <h2>Exercise</h2>
          <div className="score">Score {props.score.correct}/{props.score.total} ({accuracy}%)</div>
        </div>
        {props.error && <div className="error">{props.error}</div>}
        {!props.exercise && <p className="empty">Generate an exercise to begin.</p>}
        {props.exercise && (
          <>
            <p className="prompt">{promptForExercise(props.exercise)}</p>
            <div className="controls">
              <button onClick={() => props.onShowRomanChange(!props.showRoman)}>{props.showRoman ? "Hide Progression" : "Show Progression"}</button>
              <button onClick={props.onPlay} disabled={props.isPlaying}>Play</button>
              <button onClick={props.onStop}>Stop</button>
            </div>
            <div className={`progression-strip ${props.showRoman ? "" : "hidden-progression"}`}>
              {props.exercise.renderedChords.map((symbol, index) => {
                const roman = props.exercise?.promptProgression?.[index] ?? props.exercise?.originalProgression[index];
                const hidden = roman == null || !props.showRoman;
                return <button key={`${symbol}-${index}`} className={hidden ? "chord-block hidden" : "chord-block clickable"} onClick={() => props.onPlayChord(index)}>{hidden ? "?" : <><strong>{symbol}</strong><span>{roman}</span></>}</button>;
              })}
            </div>
            <div className="choices">
              {props.exercise.choices.map((choice) => (
                <label key={choice.id} className={props.selectedChoiceId === choice.id ? "choice selected" : "choice"}>
                  <input type="radio" name="choice" checked={props.selectedChoiceId === choice.id} onChange={() => props.onSelectChoice(choice.id)} />
                  <span>{choice.label}</span>
                  {choice.functions && <small>{choice.functions.join(" - ")}</small>}
                </label>
              ))}
            </div>
            <button className="primary" disabled={!props.selectedChoiceId} onClick={props.onSubmit}>Submit Answer</button>
            {props.feedback && <div className={props.feedback.correct ? "feedback correct" : "feedback wrong"}>{props.feedback.explanation}</div>}
          </>
        )}
      </section>
    </main>
  );
}

function promptForExercise(exercise: Exercise): string {
  if (exercise.type === "fill_missing_chord") return `Fill the missing chord: ${exercise.promptProgression?.map((item) => item ?? "?").join(" - ")}`;
  if (exercise.type === "detect_replacement") return "Listen for the replacement chord in the played progression.";
  if (exercise.type === "identify_function") return "Choose the functional sequence you hear.";
  if (exercise.type === "identify_bass_degrees") return "Choose the bass degree sequence you hear.";
  return "Choose the full progression you hear.";
}

function LibraryPage() {
  const [modeFilter, setModeFilter] = useState<"all" | Mode>("all");
  const [tagFilter, setTagFilter] = useState("all");
  const tags = Array.from(new Set(progressionLibrary.flatMap((item) => item.tags))).sort();
  const filtered = progressionLibrary.filter((item) => (modeFilter === "all" || item.mode === modeFilter || item.mode === "both") && (tagFilter === "all" || item.tags.includes(tagFilter)));
  return (
    <main className="library-page">
      <div className="filters">
        <label>Mode<select value={modeFilter} onChange={(event) => setModeFilter(event.target.value as "all" | Mode)}><option value="all">All</option><option value="major">Major</option><option value="minor">Minor</option></select></label>
        <label>Tag<select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}><option value="all">All</option>{tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select></label>
      </div>
      <div className="library-grid">
        {filtered.map((item) => <article className="progression-card" key={item.id}><h3>{item.name}</h3><div className="roman-line">{item.roman.join(" - ")}</div><p>{item.description}</p><footer><span>Difficulty {item.difficulty}</span><span>{item.tags.join(", ")}</span></footer></article>)}
      </div>
    </main>
  );
}

function DebugPage({ exercise, voicedChords, events }: { exercise: Exercise | null; voicedChords: VoicedChord[]; events: InstrumentEvent[] }) {
  return (
    <main className="debug-page">
      <h2>Debug JSON</h2>
      <pre>{JSON.stringify({ exercise, voicedChords, instrumentEvents: events }, null, 2)}</pre>
    </main>
  );
}
