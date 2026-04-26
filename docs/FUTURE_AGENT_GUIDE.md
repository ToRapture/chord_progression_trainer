# Future Agent Guide

Read `AGENT_GUIDE.md` first. The MVP is intentionally layered so future work can add richer generation, instruments, and harmony without rewriting the app.

Recommended extension order:

1. Add tests for any new progression vocabulary.
2. Extend harmony parsing only when a progression requires it.
3. Add voicing policy changes before playback changes.
4. Keep sampler and MIDI engine APIs compatible.
5. Route all AI candidates through local validators.
