import type { InstrumentEvent } from "../voicing/types";

let access: MIDIAccess | null = null;
let outputId: string | null = null;

export async function requestMidiAccess(): Promise<MIDIAccess> {
  if (access) return access;
  access = await navigator.requestMIDIAccess({ sysex: false });
  return access;
}

export function getMidiOutputs(): MIDIOutput[] {
  if (!access) return [];
  return Array.from(access.outputs.values());
}

export function setMidiOutput(id: string): void {
  outputId = id;
}

function output(): MIDIOutput | null {
  if (!access || !outputId) return null;
  return access.outputs.get(outputId) ?? null;
}

export async function playEvents(
  events: InstrumentEvent[],
  _preset?: string,
): Promise<void> {
  const out = output();
  if (!out) return;
  const start = performance.now() + 50;
  for (const ev of events) {
    const onTime = start + ev.time * 1000;
    const offTime = onTime + ev.duration * 1000;
    for (const note of ev.notes) {
      out.send([0x90, note, ev.velocity], onTime);
      out.send([0x80, note, 0], offTime);
    }
  }
}

export async function playChord(
  notes: number[],
  duration: number,
  _preset?: string,
  velocity = 90,
): Promise<void> {
  const out = output();
  if (!out) return;
  const now = performance.now() + 20;
  for (const n of notes) {
    out.send([0x90, n, velocity], now);
    out.send([0x80, n, 0], now + duration * 1000);
  }
}

export function stop(): void {
  const out = output();
  if (!out) return;
  for (let ch = 0; ch < 16; ch++) {
    out.send([0xb0 + ch, 123, 0]);
  }
  const candidate = out as MIDIOutput & { clear?: () => void };
  if (typeof candidate.clear === "function") {
    candidate.clear();
  }
}

export function dispose(): void {
  stop();
  access = null;
  outputId = null;
}
