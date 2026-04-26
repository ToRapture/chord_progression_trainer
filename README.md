# Chord Progression Trainer

一个基于罗马数字和功能组的和弦进行听辨训练器，在浏览器中运行。

将"抽象和声进行 → 题目生成 → 乐器化 voicing → 音频播放"分层实现，支持完整进行识别、缺失和弦填空、和弦替换辨认三种练习模式。可选择内置钢琴采样播放，或通过 MIDI 输出到外部音源（如 Kontakt）。

## 快速启动

```bash
npm install
npm run dev        # 开发模式，默认 http://localhost:5173
npm run build      # 生产构建，输出到 dist/
npm run preview    # 预览生产构建
npm run test       # 运行测试 (104 tests)
```

## 使用方式

### 基本流程

1. 打开页面，默认在 **Trainer** 标签
2. 选择 **Mode**（Major / Minor）和 **Key**（支持全部 24 个大小调）
3. 选择 **Exercise Type**：
   - Identify Progression — 听进行，从选项中选出正确的罗马数字进行
   - Fill Missing Chord — 进行中缺失一个和弦，选出正确的一个
   - Detect Replacement — 判断哪个位置的和弦被替换了
4. 选择 **Group** 过滤和弦进行库（Major Basic / Minor Basic / Pop / Jazz Basic，共 72 条模板）
5. 设置 Difficulty / Tempo / Choices 等参数
6. 点击 **Generate Exercise** 生成题目
7. 点击 **Play** 播放进行
8. 在答案列表中点击选项，然后 **Submit Answer**
9. 查看反馈面板（正确/错误 + 解释），点击 **Next Exercise** 继续

### 播放控制

- **Play**：播放当前题目的完整和弦进行
- **Stop**：立即停止所有声音
- 点击和弦进行显示条中的单个和弦块可以直接试听该和弦（hover 高亮，再次点击其他块会先停止前一个）

### 音色引擎

在 Settings 面板的 **Sound Engine** 下拉框中选择：

| 模式 | 说明 |
|------|------|
| **Sampler (Piano)** | 使用 Tone.js 加载 Salamander Grand Piano 真实三角钢琴采样（自动从 CDN 下载，浏览器缓存），带混响效果。**首次播放需等待采样加载。** |
| **MIDI Output** | 通过 Web MIDI API 发送 MIDI Note On/Off 到外部音源。**需要额外的虚拟 MIDI 端口配置。** |

### MIDI 模式设置

1. 下载安装 [loopMIDI](https://www.tobias-erichsen.de/software/loopmidi.html)（Windows）或使用 macOS 自带的 IAC Driver
2. 创建一个虚拟 MIDI 端口（如命名为 `Kontakt`）
3. 在 Kontakt / DAW 中将该端口设为 MIDI Input
4. 在页面中将 Sound Engine 切换为 **MIDI Output**，在 MIDI Port 下拉中选择对应端口
5. 播放时浏览器会将 MIDI 消息发送到外部音源

### Library 标签

浏览全部 72 条内置和弦进行模板，可按 Mode 和 Tag 过滤：

| 分组 | 数量 | 说明 |
|------|------|------|
| Major Basic | 25 | 大调基础进行（I-IV-V-I 等） |
| Minor Basic | 18 | 小调基础进行（i-iv-V-i 等） |
| Pop | 17 | 流行音乐常用进行 |
| Jazz Basic | 12 | 爵士入门进行（含七和弦） |

### Debug 标签

显示当前题目的完整内部状态（JSON），方便开发和调试。

## 部署到 GitHub Pages

```bash
npm run deploy      # 构建并推送到 gh-pages 分支
```

部署后访问 `https://torapture.github.io/chord_progression_trainer/`。如需修改部署路径，编辑 `vite.config.ts` 中的 `base` 字段。

## 技术栈

- **Vite + React 18 + TypeScript** — 前端框架
- **Tone.js** — 音频播放（Sampler + Reverb）
- **Tonal.js** — 音乐理论计算（调性、和弦、音名转换）
- **Web Audio API** — 底层音频引擎
- **Web MIDI API** — MIDI 输出
- **Vitest** — 测试（104 tests）
- 纯 CSS，无外部 UI 库

## 支持的调性

全部 24 个大小调（12 个 major + 12 个 minor），每个半音上的调都有。通过 Tonal.js 动态解析和弦符号，任何调性下的罗马数字进行都能正确转换为实际音高。

## 项目架构

```
src/
  app/              React UI (App.tsx, main.tsx, styles.css)
  core/
    harmony/        和声理论（调性、罗马数字→和弦符号转换）
    progressions/   和弦进行库（72 条模板）
    exercises/      练习生成、干扰项、评分
    voicing/        声部编排（candidates、voice leading、presets）
    instruments/    乐器配置（piano、guitar、strings）
    playback/       播放引擎（toneEngine.ts、midiEngine.ts、scheduler.ts）
    ai/             AI 出题预留接口
  tests/            测试文件
```

## 本地验证音高

打开浏览器 DevTools Console，播放时可以看到每条音符的详细信息：

**Sampler 模式**：
```
[Sampler] playEvents (4 chords, preset: piano_clear)
  Chord 1: C4(60)←C4.mp3(0st) E4(64)←D#4.mp3(+1st) G4(67)←F#4.mp3(+1st) C5(72)←C5.mp3(0st)
```
显示每个音符的 MIDI 值、使用的采样文件名、pitch-shift 量（0st = 精确命中，+1st = 升 1 半音）。

**MIDI 模式**：
```
[MIDI] playEvents (4 chords)
  Chord 1: C4(60) E4(64) G4(67) C5(72) | t=0.00s dur=3.27s vel=89
```
显示每个音符的 MIDI 值、时间、力度。

## License

MIT
