import React, { useState, useCallback, useMemo } from "react";
import { MusicalKey, Mode, RomanNumeralSymbol } from "../core/harmony/types";
import { SUPPORTED_KEYS, keyLabel, keyId } from "../core/harmony/keys";
import { ProgressionTemplate } from "../core/progressions/types";
import { getAllProgressions, getProgressionsByGroup } from "../core/progressions/index";
import { Exercise, ExerciseType, ExerciseGenerationOptions } from "../core/exercises/types";
import { generateExercise } from "../core/exercises/generateExercise";
import { checkAnswer, getScore } from "../core/exercises/scoring";
import { VoicedChord } from "../core/voicing/types";
import { voiceProgression } from "../core/voicing/chooseBestVoicing";
import { getPreset } from "../core/voicing/presets";
import { romanToChordSymbol } from "../core/harmony/roman";
import { InstrumentEvent, InstrumentPresetId, Articulation } from "../core/instruments/types";
import { scheduleVoicedChords } from "../core/playback/scheduler";
import { playEvents, playChord, stop, setTempo, initAudio } from "../core/playback/toneEngine";
import { MAJOR_DIATONIC_ROMANS, MINOR_DIATONIC_ROMANS } from "../core/harmony/functionGroups";

type Tab = "trainer" | "library" | "debug";

export function App() {
  const [tab, setTab] = useState<Tab>("trainer");
  const [key, setKey] = useState<MusicalKey>(SUPPORTED_KEYS[0]!);
  const [mode, setMode] = useState<Mode>("major");
  const [exerciseType, setExerciseType] = useState<ExerciseType>("identify_progression");
  const [presetId, setPresetId] = useState<InstrumentPresetId>("piano_clear");
  const [progressionGroup, setProgressionGroup] = useState<string>("all");
  const [difficultyMin, setDifficultyMin] = useState(1);
  const [difficultyMax, setDifficultyMax] = useState(5);
  const [tempo, setTempoState] = useState(72);
  const [choiceCount, setChoiceCount] = useState(4);
  const [showRoman, setShowRoman] = useState(false);

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [voicedChords, setVoicedChords] = useState<VoicedChord[]>([]);
  const [events, setEvents] = useState<InstrumentEvent[]>([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackEvents, setPlaybackEvents] = useState<InstrumentEvent[]>([]);

  const romanPool = mode === "major" ? MAJOR_DIATONIC_ROMANS : MINOR_DIATONIC_ROMANS;
  const [allowedRomans, setAllowedRomans] = useState<RomanNumeralSymbol[]>([...romanPool]);

  const currentKey = useMemo<MusicalKey>(
    () => ({ tonic: key.tonic, mode }),
    [key.tonic, mode]
  );

  const allowedRomansStr = useMemo(() => allowedRomans.join(","), [allowedRomans]);
  const difficultyRange = useMemo<[number, number]>(
    () => [difficultyMin, difficultyMax],
    [difficultyMin, difficultyMax]
  );

  const handleGenerateExercise = useCallback(() => {
    setFeedback(null);
    setSelectedChoiceId(null);
    stop();
    setIsPlaying(false);

    const options: ExerciseGenerationOptions = {
      key: currentKey,
      allowedRomans,
      exerciseType,
      difficultyRange,
      choiceCount,
      progressionGroup: progressionGroup === "all" ? undefined : progressionGroup,
    };

    const ex = generateExercise(options);
    setExercise(ex);

    const symbols = ex.renderedChords.map((c, i) => c === "?" ? ex.sourceProgression.roman[i] ?? "I" : c);
    const actualSymbols = ex.sourceProgression.roman.map((r) => romanToChordSymbol(r, currentKey));
    const romans = ex.sourceProgression.roman;

    const policy = getPreset(presetId);
    const phrasing = voiceProgression(actualSymbols, romans, policy);
    setVoicedChords(phrasing);

    const scheduled = scheduleVoicedChords(phrasing, { tempo, beatsPerChord: 4 }, presetId, "block");
    setEvents(scheduled);
  }, [currentKey, allowedRomans, exerciseType, difficultyRange, choiceCount, progressionGroup, presetId, tempo]);

  const handlePlay = useCallback(async () => {
    if (!exercise || events.length === 0) return;
    await initAudio();
    setTempo(tempo);
    setIsPlaying(true);
    setPlaybackEvents(events);
    await playEvents(events, presetId);
    const maxTime = Math.max(...events.map((e) => e.time + e.duration));
    setTimeout(() => setIsPlaying(false), maxTime * 1000 + 200);
  }, [exercise, events, presetId, tempo]);

  const handleStop = useCallback(() => {
    stop();
    setIsPlaying(false);
  }, []);

  const handlePlayChord = useCallback(
    async (index: number) => {
      const vc = voicedChords[index];
      if (!vc) return;
      stop();
      setIsPlaying(false);
      const secondsPerBeat = 60 / tempo;
      const secondsPerChord = secondsPerBeat * 4;
      await playChord(vc.allNotes, secondsPerChord * 0.98, presetId);
    },
    [voicedChords, tempo, presetId]
  );

  const handleSelectChoice = useCallback((choiceId: string) => {
    if (feedback) return;
    setSelectedChoiceId(choiceId);
  }, [feedback]);

  const handleSubmitAnswer = useCallback(() => {
    if (!exercise || !selectedChoiceId) return;
    const result = checkAnswer(exercise.id, selectedChoiceId, exercise.answerChoiceId);

    const selectedChoice = exercise.choices.find((c) => c.id === selectedChoiceId);
    setFeedback({
      correct: result.isCorrect,
      explanation: exercise.explanation + (selectedChoice && !result.isCorrect
        ? ` You selected: ${selectedChoice.label}`
        : ""),
    });
  }, [exercise, selectedChoiceId]);

  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode);
    setAllowedRomans(newMode === "major" ? [...MAJOR_DIATONIC_ROMANS] : [...MINOR_DIATONIC_ROMANS]);
    setKey(newMode === "major" ? SUPPORTED_KEYS[0]! : SUPPORTED_KEYS[3]!);
  }, []);

  const score = getScore();

  const progressionsFilter = progressionGroup !== "all";

  const libraryProgressions = useMemo(() => {
    if (progressionsFilter) {
      return getProgressionsByGroup(progressionGroup);
    }
    return getAllProgressions();
  }, [progressionGroup, progressionsFilter]);

  return (
    <>
      <header className="app-header">
        <h1>Chord Progression Trainer</h1>
        <nav className="tab-nav">
          <button className={`tab-btn ${tab === "trainer" ? "active" : ""}`} onClick={() => setTab("trainer")}>
            Trainer
          </button>
          <button className={`tab-btn ${tab === "library" ? "active" : ""}`} onClick={() => setTab("library")}>
            Library
          </button>
          <button className={`tab-btn ${tab === "debug" ? "active" : ""}`} onClick={() => setTab("debug")}>
            Debug
          </button>
        </nav>
      </header>

      <main className="app-main">
        {tab === "trainer" && (
          <TrainerPage
            key={keyId(currentKey)}
            mode={mode}
            exerciseType={exerciseType}
            presetId={presetId}
            progressionGroup={progressionGroup}
            difficultyMin={difficultyMin}
            difficultyMax={difficultyMax}
            tempo={tempo}
            choiceCount={choiceCount}
            showRoman={showRoman}
            allowedRomans={allowedRomans}
            exercise={exercise}
            voicedChords={voicedChords}
            selectedChoiceId={selectedChoiceId}
            feedback={feedback}
            isPlaying={isPlaying}
            score={score}
            onModeChange={handleModeChange}
            onKeyChange={setKey}
            onExerciseTypeChange={setExerciseType}
            onPresetIdChange={setPresetId}
            onProgressionGroupChange={setProgressionGroup}
            onDifficultyMinChange={setDifficultyMin}
            onDifficultyMaxChange={setDifficultyMax}
            onTempoChange={setTempoState}
            onChoiceCountChange={setChoiceCount}
            onShowRomanChange={setShowRoman}
            onGenerateExercise={handleGenerateExercise}
            onPlay={handlePlay}
            onStop={handleStop}
            onSelectChoice={handleSelectChoice}
            onSubmitAnswer={handleSubmitAnswer}
            onPlayChord={handlePlayChord}
          />
        )}

        {tab === "library" && (
          <LibraryPage progressions={libraryProgressions} />
        )}

        {tab === "debug" && (
          <DebugPage
            exercise={exercise}
            voicedChords={voicedChords}
            events={events}
          />
        )}
      </main>
    </>
  );
}

interface TrainerPageProps {
  mode: Mode;
  exerciseType: ExerciseType;
  presetId: InstrumentPresetId;
  progressionGroup: string;
  difficultyMin: number;
  difficultyMax: number;
  tempo: number;
  choiceCount: number;
  showRoman: boolean;
  allowedRomans: RomanNumeralSymbol[];
  exercise: Exercise | null;
  voicedChords: VoicedChord[];
  selectedChoiceId: string | null;
  feedback: { correct: boolean; explanation: string } | null;
  isPlaying: boolean;
  score: { correct: number; total: number; percentage: number };
  onModeChange: (mode: Mode) => void;
  onKeyChange: (key: MusicalKey) => void;
  onExerciseTypeChange: (type: ExerciseType) => void;
  onPresetIdChange: (id: InstrumentPresetId) => void;
  onProgressionGroupChange: (group: string) => void;
  onDifficultyMinChange: (v: number) => void;
  onDifficultyMaxChange: (v: number) => void;
  onTempoChange: (v: number) => void;
  onChoiceCountChange: (v: number) => void;
  onShowRomanChange: (v: boolean) => void;
  onGenerateExercise: () => void;
  onPlay: () => void;
  onStop: () => void;
  onSelectChoice: (id: string) => void;
  onSubmitAnswer: () => void;
  onPlayChord: (index: number) => void;
}

function TrainerPage(props: TrainerPageProps) {
  const keysForMode = SUPPORTED_KEYS.filter((k) => k.mode === props.mode);

  return (
    <div>
      <div className="panel">
        <div className="panel-title">Settings</div>
        <div className="control-row">
          <div className="control-group">
            <label>Mode</label>
            <select value={props.mode} onChange={(e) => props.onModeChange(e.target.value as Mode)}>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
            </select>
          </div>
          <div className="control-group">
            <label>Key</label>
            <select
              value={keyId({ tonic: keysForMode[0]?.tonic ?? "C", mode: props.mode })}
              onChange={(e) => {
                const parts = e.target.value.split("_");
                props.onKeyChange({ tonic: parts[0]!, mode: parts[1] as Mode });
              }}
            >
              {keysForMode.map((k) => (
                <option key={keyId(k)} value={keyId(k)}>
                  {keyLabel(k)}
                </option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label>Exercise Type</label>
            <select value={props.exerciseType} onChange={(e) => props.onExerciseTypeChange(e.target.value as ExerciseType)}>
              <option value="identify_progression">Identify Progression</option>
              <option value="fill_missing_chord">Fill Missing Chord</option>
              <option value="detect_replacement">Detect Replacement</option>
            </select>
          </div>
          <div className="control-group">
            <label>Instrument</label>
            <select value={props.presetId} onChange={(e) => props.onPresetIdChange(e.target.value as InstrumentPresetId)}>
              <option value="piano_clear">Piano Clear</option>
              <option value="piano_smooth">Piano Smooth</option>
              <option value="guitar_open">Guitar Open</option>
              <option value="strings_quartet_basic">Strings Quartet</option>
            </select>
          </div>
          <div className="control-group">
            <label>Group</label>
            <select value={props.progressionGroup} onChange={(e) => props.onProgressionGroupChange(e.target.value)}>
              <option value="all">All</option>
              <option value="majorBasic">Major Basic</option>
              <option value="minorBasic">Minor Basic</option>
              <option value="pop">Pop</option>
              <option value="jazzBasic">Jazz Basic</option>
            </select>
          </div>
        </div>

        <div className="control-row" style={{ marginTop: "0.75rem" }}>
          <div className="control-group">
            <label>Difficulty Min</label>
            <input
              type="number"
              min={1}
              max={5}
              value={props.difficultyMin}
              onChange={(e) => props.onDifficultyMinChange(Number(e.target.value))}
            />
          </div>
          <div className="control-group">
            <label>Difficulty Max</label>
            <input
              type="number"
              min={1}
              max={5}
              value={props.difficultyMax}
              onChange={(e) => props.onDifficultyMaxChange(Number(e.target.value))}
            />
          </div>
          <div className="control-group">
            <label>Tempo (BPM)</label>
            <input
              type="number"
              min={40}
              max={240}
              value={props.tempo}
              onChange={(e) => props.onTempoChange(Number(e.target.value))}
            />
          </div>
          <div className="control-group">
            <label>Choices</label>
            <input
              type="number"
              min={2}
              max={8}
              value={props.choiceCount}
              onChange={(e) => props.onChoiceCountChange(Number(e.target.value))}
            />
          </div>
          <button className="btn btn-primary" onClick={props.onGenerateExercise}>
            Generate Exercise
          </button>
        </div>

        <div className="score-display" style={{ marginTop: "0.75rem" }}>
          <span>
            Score: <span className="score-value">{props.score.correct}</span>/{props.score.total}
          </span>
          <span>
            Rate: <span className="score-value">{props.score.percentage}%</span>
          </span>
        </div>
      </div>

      {props.exercise && (
        <>
          <div className="panel">
            <div className="panel-title">Exercise</div>
            <div className="exercise-prompt">{props.exercise.prompt}</div>

            <div className="toggle-row">
              <button
                className={`toggle-btn ${props.showRoman ? "active" : ""}`}
                onClick={() => props.onShowRomanChange(!props.showRoman)}
              >
                {props.showRoman ? "Hide" : "Show"} Progression
              </button>
            </div>

            <div className={`progression-display ${props.showRoman ? "visible" : "hidden-progression"}`}>
              {(props.exercise.promptProgression ?? props.exercise.sourceProgression.roman).map((r, i) => (
                <span
                  key={i}
                  className={`progression-chord ${r === null ? "gap" : "clickable"}`}
                  onClick={() => {
                    if (r !== null && props.voicedChords[i]) {
                      props.onPlayChord(i);
                    }
                  }}
                >
                  {r === null ? "?" : i < props.exercise!.renderedChords.length ? props.exercise!.renderedChords[i] : r}
                </span>
              ))}
            </div>

            <div className="progression-actions">
              <button className="btn btn-primary" onClick={props.onPlay} disabled={props.isPlaying}>
                {props.isPlaying ? "Playing..." : "Play"}
              </button>
              <button className="btn btn-danger" onClick={props.onStop}>
                Stop
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">Answer</div>
            <div className="choice-list">
              {props.exercise.choices.map((choice) => {
                let cls = "choice-item";
                if (props.selectedChoiceId === choice.id) cls += " selected";
                if (props.feedback) {
                  if (choice.id === props.exercise!.answerChoiceId) cls += " correct";
                  else if (props.selectedChoiceId === choice.id && !choice.isCorrect) cls += " incorrect";
                }
                return (
                  <div
                    key={choice.id}
                    className={cls}
                    onClick={() => props.onSelectChoice(choice.id)}
                  >
                    {choice.label}
                    {choice.functions && choice.functions.length > 0 && (
                      <span style={{ marginLeft: "0.5rem", color: "var(--text-dim)", fontSize: "0.8rem" }}>
                        [{choice.functions.join(" → ")}]
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {props.selectedChoiceId && !props.feedback && (
              <div className="progression-actions">
                <button className="btn btn-primary" onClick={props.onSubmitAnswer}>
                  Submit Answer
                </button>
              </div>
            )}
          </div>

          {props.feedback && (
            <div className={`feedback-panel ${props.feedback.correct ? "correct" : "incorrect"}`}>
              <div className={`feedback-title ${props.feedback.correct ? "correct" : "incorrect"}`}>
                {props.feedback.correct ? "Correct!" : "Incorrect"}
              </div>
              <div className="explanation">{props.feedback.explanation}</div>
              <div className="progression-actions">
                <button className="btn btn-primary" onClick={props.onGenerateExercise}>
                  Next Exercise
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {!props.exercise && (
        <div className="empty-state">
          <p>Click "Generate Exercise" to start training.</p>
        </div>
      )}
    </div>
  );
}

interface LibraryPageProps {
  progressions: ProgressionTemplate[];
}

function LibraryPage({ progressions }: LibraryPageProps) {
  const [filterMode, setFilterMode] = useState<string>("all");
  const [filterGroup, setFilterGroup] = useState<string>("all");

  const filtered = progressions.filter((p) => {
    if (filterMode !== "all" && p.mode !== filterMode) return false;
    if (filterGroup !== "all" && !p.tags.includes(filterGroup)) return false;
    return true;
  });

  const groups = ["majorBasic", "minorBasic", "pop", "jazzBasic"] as const;

  return (
    <div>
      <div className="panel">
        <div className="panel-title">Progression Library ({filtered.length} progressions)</div>
        <div className="control-row">
          <div className="control-group">
            <label>Mode</label>
            <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)}>
              <option value="all">All</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
            </select>
          </div>
          <div className="control-group">
            <label>Tag</label>
            <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
              <option value="all">All</option>
              <option value="basic">Basic</option>
              <option value="cadence">Cadence</option>
              <option value="pop">Pop</option>
              <option value="jazz">Jazz</option>
              <option value="rock">Rock</option>
              <option value="extended">Extended</option>
            </select>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="library-list">
          {filtered.map((p) => (
            <div key={p.id} className="library-item">
              <span className="library-roman">{p.roman.join(" → ")}</span>
              <span className="library-desc">{p.title} — {p.description || ""}</span>
              <span className="library-diff">L{p.difficulty}</span>
              {p.tags.slice(0, 3).map((t) => (
                <span key={t} className="library-tag">{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DebugPageProps {
  exercise: Exercise | null;
  voicedChords: VoicedChord[];
  events: InstrumentEvent[];
}

function DebugPage({ exercise, voicedChords, events }: DebugPageProps) {
  return (
    <div>
      <div className="panel">
        <div className="panel-title">Debug View</div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", marginBottom: "1rem" }}>
          This page shows the full internal state for developers and future AI agents to inspect.
        </p>
      </div>

      <div className="debug-section">
        <h3>Exercise</h3>
        <div className="debug-json">{JSON.stringify(exercise, null, 2) || "No exercise generated yet"}</div>
      </div>

      <div className="debug-section">
        <h3>Voiced Chords</h3>
        <div className="debug-json">{JSON.stringify(voicedChords, null, 2) || "No voicing computed"}</div>
      </div>

      <div className="debug-section">
        <h3>Instrument Events</h3>
        <div className="debug-json">{JSON.stringify(events, null, 2) || "No events scheduled"}</div>
      </div>
    </div>
  );
}
