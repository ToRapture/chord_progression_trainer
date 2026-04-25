# 和弦进行听辨训练器：本地 AI Agent 项目生成说明书

> 目标：请根据本文档生成一个可本地运行的 Web 项目，用于训练“调内和弦进行听辨、功能组听辨、低音级数听辨、和弦替换辨认”。  
> 当前版本暂不接入 AI 出题，但代码结构必须预留 AI 生成题库入口。  
> 优先实现稳定、可扩展、可测试的核心引擎，而不是一次性做复杂音色和管弦编配。

---

## 0. 给本地 AI Agent 的总体指令

你要生成一个 TypeScript Web 项目。推荐技术栈：

- Vite
- React
- TypeScript
- Tone.js
- Tonal.js
- Vitest
- React `useState` + `useCallback`（轻量状态管理，未引入 Zustand）
- 纯 CSS（无 CSS Modules / Tailwind）

项目应能本地运行：

```bash
npm install
npm run dev
npm run test
npm run lint
npm run build
```

如果你选择了不同但合理的前端方案，也必须保证结构清晰、测试可运行、核心音乐逻辑与 UI 解耦。

---

## 1. 项目目标

这个项目不是普通的“弹一个和弦让用户猜名称”的工具，而是一个上下文中的和弦进行听辨训练器。

用户可以：

1. 选择调性，例如 C major、D minor。
2. 选择允许出现的和弦集合，例如 I, ii, IV, V, V7, vi。
3. 选择练习类型：
   - 完整进行识别
   - 缺失和弦填空
   - 单个和弦替换判断
   - 功能组判断
   - 低音级数判断
4. 选择播放风格：
   - Piano Clear
   - Piano Smooth
   - Guitar Open Chords
   - String Quartet Basic
5. 播放题目。
6. 从选项里选择答案。
7. 查看反馈，包括：
   - 正确进行
   - 用户选择
   - 错误位置
   - 罗马数字
   - 具体和弦
   - 功能组
   - 低音级数
   - 简短解释

---

## 2. 核心设计原则

### 2.1 把和声逻辑与播放逻辑分开

不要把 `I -> C -> C4 E4 G4` 写死在一起。

应拆成：

```text
Roman progression
→ chord symbols
→ pitch classes
→ voicing candidates
→ selected voicing
→ instrument events
→ audio playback
```

### 2.2 罗马数字是核心内部表示

内部题库尽量使用罗马数字，而不是具体音名。

例如：

```ts
["I", "vi", "IV", "V"]
```

在 C major 中渲染为：

```ts
["C", "Am", "F", "G"]
```

在 D major 中渲染为：

```ts
["D", "Bm", "G", "A"]
```

### 2.3 训练清晰度优先于“花哨好听”

初级听辨中，低音应清楚，和弦性质应明确。  
可以提供更音乐化的 voicing，但不要让音色、七和弦、add9、sus4 干扰基础听辨。

### 2.4 AI 生成只作为未来接入点

当前版本不接入 DeepSeek 或其他 LLM。  
但是项目结构必须预留：

```text
src/ai/
src/ai/ProgressionAIGenerator.ts
src/ai/types.ts
```

AI 将来只负责生成候选 JSON，最终仍必须经过本地 validator。

---

## 3. 参考技术与依赖

### 3.1 Tonal.js

用于音名、音程、和弦、音阶、调性、罗马数字等音乐理论处理。  
建议用于：

- Roman numeral parsing
- chord symbol parsing
- pitch class calculation
- transposition
- note normalization

参考：

- https://github.com/tonaljs/tonal
- https://tonaljs.github.io/tonal/docs/notation/roman-numerals

### 3.2 Tone.js

用于浏览器音频播放。  
当前使用：

- `Tone.Sampler` + Salamander Grand Piano 真实钢琴采样（来源：`https://tonejs.github.io/audio/salamander/`）
- `Tone.Reverb` 混响效果器
- `Tone.Transport` 用于 BPM 控制

早期版本使用过 `Tone.PolySynth`，已替换为采样引擎。  
另支持通过 Web MIDI API 输出 MIDI 到外部音源（如 Kontakt）。

参考：

- https://tonejs.github.io/docs/
- https://tonejs.github.io/docs/15.1.22/classes/Sampler.html

### 3.3 Web Audio API & Web MIDI API

Tone.js 底层基于 Web Audio。  
项目同时支持 Web MIDI API 输出 MIDI 到外部设备/软件。

- Tone.js 采样引擎：`src/core/playback/toneEngine.ts`
- Web MIDI 引擎：`src/core/playback/midiEngine.ts`
- 需要 loopMIDI（Windows）/ IAC Driver（macOS）创建虚拟 MIDI 端口连接外部音源

参考：

- https://developer.mozilla.org/docs/Web/API/Web_Audio_API
- https://developer.mozilla.org/docs/Web/API/Web_MIDI_API

### 3.4 music21

当前项目不需要 Python，但后续如果做乐谱分析、MIDI 导出、Roman numeral corpus 分析，可参考 music21。

参考：

- https://music21.org/music21docs/usersGuide/usersGuide_23_romanNumerals.html
- https://music21.org/music21docs/moduleReference/moduleVoiceLeading.html

---

## 4. 实际项目目录结构

实现时采用了 `src/core/` 统一包裹各领域模块的结构：

```text
chord-progression-trainer/
  .gitignore
  package.json
  package-lock.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts
  index.html

  public/
    samples/
      README.md

  docs/
    ARCHITECTURE.md
    PROJECT_MAP.md
    FUTURE_AGENT_GUIDE.md
    MUSIC_THEORY_NOTES.md

  src/
    app/
      App.tsx          # 包含 TrainerPage、LibraryPage、DebugPage（内联组件，未拆分文件）
      main.tsx          # React 入口
      styles.css        # 全局样式

    core/
      ai/               # AI 生成预留接口
        types.ts
        localProvider.ts
        README.md
      exercises/        # 题目生成、干扰项、评分
        types.ts
        generateExercise.ts
        distractors.ts
        scoring.ts
      harmony/           # 和声理论（原 spec 的 theory/）
        types.ts
        keys.ts
        roman.ts
        chordSymbols.ts
        functionGroups.ts
        validateProgression.ts
      instruments/       # 乐器配置
        types.ts
        index.ts
        piano.ts
        guitar.ts
        strings.ts
      playback/          # 播放引擎
        types.ts
        scheduler.ts
        toneEngine.ts    # Tone.js Sampler 引擎
        midiEngine.ts    # Web MIDI API 引擎
      progressions/      # 和弦进行库
        types.ts
        index.ts
        majorBasic.ts
        minorBasic.ts
        pop.ts
        jazzBasic.ts
      voicing/           # 声部编排
        types.ts
        index.ts
        pitchUtils.ts
        generateCandidates.ts
        voiceLeading.ts
        chooseBestVoicing.ts
        presets.ts

    data/
      README.md

    tests/
      harmony.test.ts
      progressionValidation.test.ts
      voicing.test.ts
      exerciseGeneration.test.ts
```

与原始推荐结构的差异：
- 所有核心模块放入 `src/core/`，而非散落在 `src/` 顶层
- UI 组件未拆分为独立文件，全部内联在 `App.tsx` 中（TrainerPage、LibraryPage、DebugPage 为函数组件）
- 未使用 Zustand、CSS Modules、Tailwind
- 未实现 `playback/patterns.ts`（arpeggio/strum 调度逻辑在 `scheduler.ts` 中）
- 新增 `midiEngine.ts` 支持 Web MIDI 输出

---

## 5. 生成后的项目文档要求

生成项目时必须包含以下文档，方便后续新 session 的 AI agent 读懂项目。

### 5.1 README.md

面向用户和开发者，包含：

- 项目用途
- 快速启动
- 当前支持功能
- 练习类型说明
- 主要技术栈
- 常见问题

### 5.2 AGENT_GUIDE.md

面向后续 AI agent，必须包含：

- 项目核心架构
- 不要修改哪些设计边界
- 新增和弦进行的方式
- 新增乐器 preset 的方式
- 新增练习类型的方式
- 新增 AI 生成入口的方式
- 测试命令
- 常见坑

### 5.3 PROJECT_MAP.md

面向代码导航，必须列出：

- 每个核心目录职责
- 关键文件说明
- 数据流
- 示例调用链

例如：

```text
用户点击 Play
→ TrainerPage
→ exercise.currentExercise
→ playback/scheduler.ts
→ voicing/index.ts
→ playback/toneEngine.ts
```

### 5.4 src/ai/README.md

说明当前暂不接入 AI，但预留接口：

```text
User request
→ AI generator
→ JSON candidate
→ local validator
→ progression library or temporary exercise
```

强调：LLM 输出永远不能直接进入题库或播放，必须验证。

---

## 6. 核心类型设计

### 6.1 基础音乐类型

文件：`src/core/harmony/types.ts`

```ts
export type Mode = "major" | "minor";

export type FunctionGroup = "T" | "PD" | "D" | "OTHER";

export type RomanNumeral = string;

export type ChordSymbol = string;

export type NoteName = string;

export type PitchClass = string;

export type KeySignature = {
  tonic: string;
  mode: Mode;
};

export type ChordInKey = {
  roman: RomanNumeral;
  symbol: ChordSymbol;
  functionGroup: FunctionGroup;
  scaleDegree: number;
  chordTones: PitchClass[];
  source: "diatonic" | "harmonic_minor" | "melodic_minor" | "borrowed" | "secondary_dominant" | "custom";
};
```

### 6.2 和弦进行模板

文件：`src/core/progressions/types.ts`

```ts
export type ProgressionTemplate = {
  id: string;
  name: string;
  mode: "major" | "minor" | "both";
  roman: RomanNumeral[];
  functions: FunctionGroup[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  description: string;
  cadence?: "authentic" | "plagal" | "half" | "deceptive" | "loop" | "none";
};
```

### 6.3 练习类型

文件：`src/core/exercises/types.ts`

```ts
export type ExerciseType =
  | "identify_progression"
  | "fill_missing_chord"
  | "detect_replacement"
  | "identify_function"
  | "identify_bass_degrees";

export type Exercise = {
  id: string;
  type: ExerciseType;
  key: KeySignature;
  originalProgression: RomanNumeral[];
  renderedChords: ChordSymbol[];
  promptProgression?: (RomanNumeral | null)[];
  targetIndex?: number;
  choices: ExerciseChoice[];
  answerId: string;
  explanation: string;
  metadata: {
    difficulty: number;
    tags: string[];
    instrumentPreset: string;
  };
};

export type ExerciseChoice = {
  id: string;
  label: string;
  roman?: RomanNumeral[];
  functions?: FunctionGroup[];
  bassDegrees?: number[];
  isCorrect: boolean;
};
```

### 6.4 Voicing 类型

文件：`src/core/voicing/types.ts`

```ts
export type MidiNote = number;

export type VoicedChord = {
  chordSymbol: ChordSymbol;
  roman: RomanNumeral;
  bass: MidiNote;
  upperVoices: MidiNote[];
  allNotes: MidiNote[];
};

export type VoicingPolicy = {
  id: string;
  name: string;
  bassRange: [MidiNote, MidiNote];
  upperRange: [MidiNote, MidiNote];
  upperVoiceCount: number;
  preferRootBass: boolean;
  allowInversions: boolean;
  allowOmitFifth: boolean;
  allowExtensions: boolean;
  smoothVoiceLeading: boolean;
  maxUpperVoiceLeap: number;
};

export type InstrumentPresetId =
  | "piano_clear"
  | "piano_smooth"
  | "guitar_open"
  | "strings_quartet_basic";

export type InstrumentEvent = {
  time: number;
  duration: number;
  instrument: string;
  notes: MidiNote[];
  velocity: number;
  articulation?: "block" | "arpeggio" | "strum" | "sustain";
};
```

---

## 7. 预设和弦进行库

已实现 72 条模板，按风格拆分文件。  
不要全部塞进一个文件，要按风格/调式拆分。

| 分组         | 文件                                         | 数量 |
|--------------|----------------------------------------------|------|
| Major Basic  | `src/core/progressions/majorBasic.ts`        | 25   |
| Minor Basic  | `src/core/progressions/minorBasic.ts`        | 18   |
| Pop          | `src/core/progressions/pop.ts`                | 17   |
| Jazz Basic   | `src/core/progressions/jazzBasic.ts`         | 12   |

### 7.1 大调基础库

文件：`src/core/progressions/majorBasic.ts`

至少包含：

```text
I - V - I
I - IV - V - I
I - ii - V - I
I - vi - IV - V
I - vi - ii - V
I - IV - I - V
I - V - vi - IV
I - iii - IV - V
vi - IV - I - V
I - V - IV - I
I - ii - IV - V
I - IV - vi - V
I - vi - iii - IV
I - iii - vi - IV
I - IV - ii - V - I
I - vi - IV - ii - V - I
```

每条都要有：

- id
- name
- roman
- functions
- difficulty
- tags
- description
- cadence

### 7.2 小调基础库

文件：`src/core/progressions/minorBasic.ts`

至少包含：

```text
i - V - i
i - iv - V - i
i - ii° - V - i
i - VI - VII - i
i - VII - VI - V
i - iv - VII - III
i - VI - III - VII
i - iv - i - V
i - VII - III - VI
i - iv - V7 - i
i - iv - ii° - V7 - i
i - VI - iv - V7
i - bVII - bVI - V7
i - VII - III - VI - ii° - V - i
```

注意：小调中 `V`、`V7` 默认来自 harmonic minor。  
必须在 `ChordInKey.source` 中标注。

### 7.3 Pop 库

文件：`src/core/progressions/pop.ts`

至少包含：

```text
I - V - vi - IV
vi - IV - I - V
I - vi - IV - V
I - V - vi - iii - IV - I - IV - V
I - V - IV - V
I - IV - V - IV
I - bVII - IV - I
I - V - vi - V
I - iii - vi - IV
I - vi - ii - V
```

### 7.4 Jazz 入门库

文件：`src/core/progressions/jazzBasic.ts`

至少包含：

```text
ii7 - V7 - Imaj7
Imaj7 - vi7 - ii7 - V7
iii7 - vi7 - ii7 - V7
Imaj7 - VI7 - ii7 - V7
ii7 - V7 - iii7 - vi7
Imaj7 - IVmaj7 - viiø7 - III7 - vi7 - ii7 - V7 - Imaj7
```

Jazz 库可以先作为进阶库，不一定在 UI 默认启用。

---

## 8. 调性与可用和弦集合

### 8.1 支持的调性

实际支持 6 个调（MVP 要求 2 个）：

| Mode  | Keys              |
|-------|-------------------|
| Major | C, G, F           |
| Minor | A, D, E           |

每个调通过 Tonal.js 的 `Key.majorKey(t)` / `Key.minorKey(t)` 动态解析和弦符号。

### 8.2 默认大调 vocabulary

文件：`src/core/harmony/keys.ts`

C major 只是示例，实际应可移调：

```text
I, ii, iii, IV, V, V7, vi, vii°
```

功能组：

```ts
{
  T: ["I", "iii", "vi"],
  PD: ["ii", "IV"],
  D: ["V", "V7", "vii°"]
}
```

### 8.2 默认小调 vocabulary

```text
i, ii°, III, iv, v, V, V7, VI, VII, vii°
```

功能组：

```ts
{
  T: ["i", "III", "VI"],
  PD: ["ii°", "iv", "VI"],
  D: ["v", "V", "V7", "VII", "vii°"]
}
```

实际实现中可以保守一些，把 `VII` 标成 OTHER 或 D-like，避免理论争议。  
UI 中可以显示“功能组是训练用近似分类，不是唯一分析答案”。

---

## 9. 练习生成逻辑

文件：`src/core/exercises/generateExercise.ts`

已实现 3 种题型。`identify_function` 和 `identify_bass_degrees` 暂未实现（类型已定义，UI 已预留选项位）。

### 9.1 生成输入

```ts
export type ExerciseGenerationOptions = {
  key: KeySignature;
  allowedRomans: RomanNumeral[];
  exerciseType: ExerciseType;
  difficultyRange: [number, number];
  tags?: string[];
  instrumentPreset: InstrumentPresetId;
  choiceCount: number;
};
```

### 9.2 完整进行识别

流程：

```text
1. 从 progression library 过滤符合 key.mode、difficulty、allowedRomans 的模板
2. 随机选一条作为 answer
3. 生成 3 个干扰项
4. 干扰项优先选择长度相同、功能相近、只差 1-2 个和弦的进行
5. 返回 Exercise
```

### 9.3 缺失和弦填空

流程：

```text
1. 选一条 progression
2. 随机选 targetIndex，避免过于简单时总是最后一个
3. promptProgression[targetIndex] = null
4. 正确选项为原和弦
5. 干扰项优先来自：
   - 同功能组
   - 相邻功能组
   - 常混淆 pair
```

常混淆 pair：

```ts
[
  ["IV", "ii"],
  ["vi", "iii"],
  ["V", "vii°"],
  ["I", "vi"],
  ["V", "V7"],
  ["iv", "ii°"],
  ["VI", "iv"]
]
```

### 9.4 单个和弦替换判断

流程：

```text
1. 选一条 progression
2. 选一个 targetIndex
3. 根据 replacementPolicy 替换：
   - same_function
   - different_function
   - close_bass_degree
4. 播放被替换后的版本
5. 用户选择哪个位置/哪个和弦被替换
```

第一版可以简化为：显示原模板但隐藏一个位置，让用户选实际播放的是哪个和弦。

### 9.5 功能组判断

播放完整进行，选项是：

```text
T - PD - D - T
T - T - PD - D
T - D - T - D
...
```

### 9.6 低音级数判断

播放完整进行，选项是：

```text
1 - 6 - 4 - 5
1 - 3 - 4 - 5
1 - 6 - 2 - 5
...
```

---

## 10. 和声校验器

文件：`src/core/harmony/validateProgression.ts`

必须实现：

```ts
validateProgressionTemplate(template: ProgressionTemplate): ValidationResult

validateProgressionAgainstOptions(
  progression: RomanNumeral[],
  options: ExerciseGenerationOptions
): ValidationResult
```

至少检查：

- roman 不为空
- 每个 roman 可解析
- 每个 roman 在 allowedRomans 内
- mode 匹配
- functions 数量与 roman 数量一致
- difficulty 在 1-5
- tags 非空
- jazz / borrowed / secondary dominant 不应出现在初级默认题中

---

## 11. Voicing Engine

### 11.1 总体思路

文件：`src/core/voicing/index.ts`

输入：

```ts
{
  key: KeySignature,
  progression: RomanNumeral[],
  instrumentPreset: InstrumentPresetId
}
```

输出：

```ts
VoicedChord[]
```

流程：

```text
1. Roman → ChordSymbol
2. ChordSymbol → PitchClasses
3. 根据 instrument preset 生成候选 voicing
4. 根据 previous voicing 选择最自然的候选
5. 输出 VoicedChord[]
```

### 11.2 候选生成

文件：`src/core/voicing/generateCandidates.ts`

给一个和弦生成多个候选：

- root position
- first inversion
- second inversion
- close position
- open position
- bass + upper triad
- optional seventh
- optional omitted fifth

不要一开始做太复杂。  
先保证每个常用三和弦和七和弦都能生成可播放音高。

### 11.3 声部连接评分

文件：`src/core/voicing/voiceLeading.ts`

实现：

```ts
scoreVoicingCandidate(
  previous: VoicedChord | null,
  candidate: VoicedChord,
  policy: VoicingPolicy
): number
```

评分建议：

```text
score =
  totalUpperVoiceMovement * 1.0
  + largeLeapPenalty * 2.0
  + rangePenalty * 3.0
  + muddyLowIntervalPenalty * 3.0
  + missingThirdPenalty * 5.0
  + badBassPenalty * 4.0
```

规则：

- 上声部尽量少移动
- 共同音尽量保留
- 低音默认用根音，除非 preset 允许转位
- 低音区避免密集小三度/大三度
- 三音不可省略
- 七和弦中三音和七音优先
- 五音可省略
- 不要让上声部跨越到 bass 以下

### 11.4 Piano Clear

文件：`src/voicing/piano.ts`

目标：听辨清晰。

策略：

```text
Bass: root in C2-C3
Upper voices: 3 notes in C4-E5
Prefer root bass: true
Smooth upper voice leading: true
Allow extensions: false
Allow omissions: false
```

示例：

```text
I - vi - IV - V in C major

C:  C2 + E4 G4 C5
Am: A2 + E4 A4 C5
F:  F2 + F4 A4 C5
G:  G2 + D4 G4 B4
```

### 11.5 Piano Smooth

目标：更自然、更音乐化，但仍清晰。

策略：

```text
Bass: root or occasional fifth in C2-C3
Upper voices: 3-4 notes in G3-D5
Allow sevenths: optional
Allow omit fifth: true
Smooth voice leading: strong
```

第一版可以不自动加七和弦，除非原 progression 已经包含 7。

### 11.6 Guitar Open

文件：`src/voicing/guitar.ts`

吉他不要完全算法生成，应使用 shape dictionary。

至少包含 C major 常用开放和弦：

```ts
{
  C:  ["C3", "E3", "G3", "C4", "E4"], // x32010
  G:  ["G2", "B2", "D3", "G3", "B3", "G4"], // 320003
  Am: ["A2", "E3", "A3", "C4", "E4"], // x02210
  Em: ["E2", "B2", "E3", "G3", "B3", "E4"], // 022000
  F:  ["F2", "C3", "F3", "A3", "C4", "F4"], // 133211
  Dm: ["D3", "A3", "D4", "F4"], // xx0231
  D:  ["D3", "A3", "D4", "F#4"], // xx0232
  E:  ["E2", "B2", "E3", "G#3", "B3", "E4"],
  A:  ["A2", "E3", "A3", "C#4", "E4"]
}
```

如果当前调渲染出的和弦没有 shape：

- fallback 到 piano-like plucked voicing
- 或显示 warning
- 不要让程序崩溃

### 11.7 String Quartet Basic

文件：`src/voicing/strings.ts`

四声部分配：

```text
Cello: bass/root
Viola: fifth or root
Violin II: third
Violin I: smooth top voice
```

实现时可以先简化：

```ts
{
  cello: bass,
  viola: lower chord tone,
  violin2: third or seventh,
  violin1: top note chosen by smooth leading
}
```

---

## 12. Playback Engine

播放引擎支持两种模式，用户可在 UI 切换：

- **Sampler 模式**（默认）：`src/core/playback/toneEngine.ts`
- **MIDI 模式**：`src/core/playback/midiEngine.ts`

### 12.1 事件调度

文件：`src/core/playback/scheduler.ts`

输入 `VoicedChord[]`，输出 `InstrumentEvent[]`。

每个和弦默认持续 4 beats，tempo 可调（40-240 BPM）。
和弦间间隔设为 `secondsPerChord * 0.98`（接近连奏），不再像早期版本额外除以 2 导致 45% 中断。

### 12.2 Sampler 引擎

文件：`src/core/playback/toneEngine.ts`

使用 `Tone.Sampler` 加载 Salamander Grand Piano 真实钢琴采样：

- 采样来源：`https://tonejs.github.io/audio/salamander/`
- 覆盖范围：A0 到 A7（小三度间隔，28 个文件）
- 效果器：`Tone.Reverb`（decay 2.0s, wet 0.2）
- 首次播放时采样从 CDN 下载，浏览器自动缓存

**Stop 行为**：`stop()` 调用 `sampler.dispose()` + `reverb.dispose()` 完全销毁采样器。这是因为 `sampler.releaseAll()` 只能释放当前发声的音符，无法取消已排期到未来的音符（`triggerAttackRelease(notes, duration, now + time, velocity)` 排期到 Web Audio 时间线的音符）。销毁后下次播放时 `getSampler()` 从缓存重建（无需重新下载）。

API：
```ts
initAudio(): Promise<void>     // 首次调用前需 Tone.start()
playEvents(events, presetId): Promise<void>
playChord(notes, duration, presetId, velocity?): Promise<void>
stop(): void                    // 销毁 sampler + reverb
setTempo(bpm): void
getTempo(): number
dispose(): void
```

### 12.3 MIDI 引擎

文件：`src/core/playback/midiEngine.ts`

通过 Web MIDI API 发送 MIDI Note On/Off 消息到外部音源。

**Stop 行为**：先对所有 16 个通道发送 All Notes Off (CC 123)，再调用 `MIDIOutput.clear()`（Chrome 支持）清除所有排期中的未来 MIDI 消息。

API 与 Sampler 引擎一致，签名完全兼容：
```ts
requestMidiAccess(): Promise<MIDIAccess>
getMidiOutputs(): MIDIOutput[]
setMidiOutput(outputId): void
playEvents(events, presetId?): Promise<void>
playChord(notes, duration, presetId?, velocity?): Promise<void>
stop(): void
dispose(): void
```

### 12.4 切换逻辑

`App.tsx` 中通过 `soundEngine` 状态（`"sampler" | "midi"`）dispatch 到对应引擎：

```ts
const eng = soundEngine === "midi" ? midiEngine : toneEngine;
await eng.playEvents(events, presetId);
```

UI 提供 Sound Engine 下拉框，MIDI 模式下额外显示 MIDI Port 选择器。

### 12.5 Instrument Presets

4 个 preset 的 voicing 策略差异在 `src/core/voicing/presets.ts` 中定义（通过不同的 `VoicingPolicy` 影响声部范围和转位行为）。Sampler 模式下所有 preset 共用同一钢琴采样，音色差异主要通过声部排布体现；MIDI 模式下音色取决于接收端音源。

---

## 13. UI 要求

### 13.1 TrainerPage

主训练界面 Settings panel 包含：

| 控件               | 值域                                                |
|--------------------|-----------------------------------------------------|
| Mode               | Major / Minor                                       |
| Key                | 6 个支持调动态生成                                   |
| Exercise Type      | Identify Progression / Fill Missing Chord / Detect Replacement |
| Instrument         | Piano Clear / Piano Smooth / Guitar Open / Strings Quartet |
| Sound Engine       | Sampler (Piano) / MIDI Output                       |
| MIDI Port          | MIDI 模式下动态列出可用输出端口                      |
| Group              | All / Major Basic / Minor Basic / Pop / Jazz Basic  |
| Difficulty Min     | 1-5                                                 |
| Difficulty Max     | 1-5                                                 |
| Tempo (BPM)        | 40-240                                              |
| Choices            | 2-8                                                 |
| Generate Exercise  | button                                              |

Exercise panel 包含：

- 题目提示文字
- **Show/Hide Progression 按钮**：切换罗马数字进行的显示/模糊
- **和弦进行显示条**：每个和弦块显示渲染后的 chord symbol，已揭示的和弦可**点击试听单和弦**（`.clickable` class，hover 高亮，`playChord()` 播放后再点另一个会先 stop 前一个）
- Play / Stop 按钮
- 答案选择列表（含功能组标注）
- Submit Answer 按钮
- 反馈面板（正确/错误 + 解释）
- Score 显示（正确数/总数/正确率）

### 13.2 点击和弦块播放

用户可直接点击和弦进行中的单个和弦块试听：

- `handlePlayChord(index)` 调用 `stop()` 停止当前播放，再调用 `playChord()` 播放该和弦的完整 voiced notes
- CSS：`cursor: pointer` + hover 红色高亮（`var(--accent)`）
- 暗状态（`hidden-progression`）下的和弦不可点击

### 13.3 DebugPage

必须提供 debug 页面，方便开发和后续 agent 检查：

显示当前题目的完整 JSON：

```json
{
  "exercise": {},
  "voicedChords": [],
  "instrumentEvents": []
}
```

这个页面对后续维护非常重要。

### 13.4 LibraryPage

显示内置 progression library，可按：

- mode (Major / Minor)
- tag (Basic / Cadence / Pop / Jazz / Rock / Extended)

过滤。每条显示罗马数字进行、标题、描述、难度、标签。

---

## 14. 状态管理

未使用 Zustand。状态管理直接在 `src/app/App.tsx` 中通过 React `useState` + `useCallback` + `useMemo` 实现。

核心状态：

```ts
{
  // Settings
  key: MusicalKey;
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
  soundEngine: "sampler" | "midi";
  midiOutputId: string | null;

  // Runtime
  exercise: Exercise | null;
  voicedChords: VoicedChord[];
  events: InstrumentEvent[];
  selectedChoiceId: string | null;
  feedback: { correct: boolean; explanation: string } | null;
  isPlaying: boolean;
}
```

核心 callbacks：

```ts
handleGenerateExercise()
handlePlay()
handleStop()
handlePlayChord(index)
handleSelectChoice(choiceId)
handleSubmitAnswer()
handleModeChange(mode)
handleSoundEngineChange(eng)
```

---

## 15. 测试要求

必须用 Vitest 写核心测试。  
不要只测 UI。

### 15.1 harmony.test.ts

测试：

- C major 中 I → C
- C major 中 vi → Am
- D major 中 I → D
- D major 中 vi → Bm
- A minor 中 i → Am
- A minor 中 V → E 或 E7，取决于 roman

### 15.2 progressionValidation.test.ts

测试：

- 所有 progression 有 id
- 所有 progression roman 非空
- functions 长度等于 roman 长度
- difficulty 在 1-5
- template 可通过 validateProgressionTemplate

### 15.3 exerciseGeneration.test.ts

测试：

- 每种 exercise type 能生成题目
- answerId 存在于 choices
- choices 数量符合设置
- fill_missing_chord 有 targetIndex
- detect_replacement 正确答案匹配替换逻辑

### 15.4 voicing.test.ts

测试：

- 每个基础和弦都能生成 notes
- notes 在合理音域
- piano_clear 有清楚 bass
- smooth voice leading 下 C → Am 保留共同音或移动较小
- 不省略三音

---

## 16. 后续扩展原则

### 16.1 新增和弦进行

新增到对应文件：

```text
src/core/progressions/majorBasic.ts
src/core/progressions/minorBasic.ts
src/core/progressions/pop.ts
src/core/progressions/jazzBasic.ts
```

每条必须经过测试和 validator。

### 16.2 新增乐器

新增：

```text
src/voicing/newInstrument.ts
src/playback/instruments.ts
```

不要改动和声层。

### 16.3 新增播放音色

优先改：

```text
src/playback/toneEngine.ts
src/playback/instruments.ts
public/samples/
```

不要改 progression 或 exercise 逻辑。

### 16.4 新增 AI 生成

未来实现：

```text
src/ai/ProgressionAIGenerator.ts
```

流程必须是：

```text
User prompt
→ LLM JSON
→ parse
→ validate
→ normalize
→ deduplicate
→ only then save/use
```

LLM 输出不能直接进入题库。

### 16.5 新增题型

新增：

```text
src/exercises/generator.ts
src/exercises/choices.ts
src/exercises/feedback.ts
src/ui/components/
```

不要把题型逻辑写进 UI。

---

## 17. MVP 完成标准

当前状态：所有标准已达成，并超越了原始 MVP。

1. 支持 6 个调：C/G/F Major, A/D/E Minor。（超出 MVP 的 C/A）
2. 实际实现了 3 种练习类型：`identify_progression`、`fill_missing_chord`、`detect_replacement`。`identify_function` 和 `identify_bass_degrees` 暂未实现。
3. 支持 4 种 Instrument preset + 2 种 Sound Engine（Sampler / MIDI）。
4. 可以生成题目、播放题目、选择答案并显示反馈。
5. DebugPage 能显示 exercise、voicedChords、instrumentEvents。
6. 内置 progression library 共 72 条。（超出 MVP 的 40 条）
7. 所有核心测试通过（104 tests）。
8. 文档完整：ARCHITECTURE.md、PROJECT_MAP.md、FUTURE_AGENT_GUIDE.md、MUSIC_THEORY_NOTES.md、chord_progression_trainer_agent_spec.md（本文档）。

---

## 18. 推荐实现顺序

请按这个顺序生成代码：

```text
1. 初始化 Vite React TypeScript 项目
2. 建立 theory 类型与 Roman → chord symbol 转换
3. 建立 progression library
4. 建立 validator
5. 建立 exercise generator
6. 建立 voicing engine 的 piano_clear
7. 建立 playback scheduler 与 Tone engine
8. 建立 TrainerPage UI
9. 建立 feedback panel
10. 建立 DebugPage
11. 增加 piano_smooth、guitar_open、strings_quartet_basic
12. 写测试
13. 写 README / AGENT_GUIDE / PROJECT_MAP
```

---

## 19. 不要做的事

第一版不要做：

- 不要接 AI API
- 不要做登录系统
- 不要做后端
- 不要做复杂 DAW 时间线
- 不要把所有逻辑塞进 React component
- 不要让 UI 直接构造 MIDI note
- 不要让音频播放逻辑反向污染和声模型

---

## 20. 验收用例

### 20.1 C major / I-vi-IV-V / piano_clear

预期：

```text
Roman: I - vi - IV - V
Chord symbols: C - Am - F - G
Bass degrees: 1 - 6 - 4 - 5
Function groups: T - T - PD - D
```

播放应有清楚 bass，不能全部挤在中低音区。

### 20.2 C major / fill missing

题目：

```text
I - ? - IV - V
```

正确答案：

```text
vi
```

干扰项可包含：

```text
iii, ii, V
```

反馈应说明 `vi` 和 `iii` 都偏主功能，但低音级数不同。

### 20.3 A minor / i-iv-V-i

预期：

```text
Roman: i - iv - V - i
Chord symbols: Am - Dm - E - Am
Function groups: T - PD - D - T
```

说明 V 来自 harmonic minor 的导音。

### 20.4 DebugPage

生成题目后 DebugPage 应显示：

```json
{
  "exercise": "...",
  "voicedChords": "...",
  "instrumentEvents": "..."
}
```

---

## 21. 关键设计边界总结

后续 agent 维护时必须记住：

```text
ProgressionTemplate 是抽象和声模板。
Exercise 是训练题。
VoicedChord 是具体音高。
InstrumentEvent 是播放事件。
UI 只负责展示和调用 action。
Playback 不应该知道 Roman numeral 的理论含义。
AI 输出必须经过 validator。
```

如果要修改或扩展项目，应优先在对应层做改动，不要跨层硬编码。

---

## 22. 附：可以直接放入 README 的一句项目描述

这是一个基于罗马数字、功能组和声部连接的和弦进行听辨训练器。它将"抽象和声进行""题目生成""乐器化 voicing""音频播放"分层实现，使用户可以在固定调性与和弦集合中练习完整进行识别、缺失和弦填空、功能组判断和低音级数听辨，并为后续接入 AI 生成题库预留本地校验接口。
