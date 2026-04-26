# Self-hosting the piano samples

By default, `src/core/playback/toneEngine.ts` loads the Salamander Grand Piano samples from the public Tone.js CDN:

```
https://tonejs.github.io/audio/salamander/
```

This means the first chord you play has a network delay (~1-3 seconds while the 28 mp3 samples download) and the app doesn't work offline. To remove that, host them locally:

1. Download all 28 mp3 files listed in the `SAMPLES` map in `src/core/playback/toneEngine.ts` from the Tone.js CDN above and place them in this directory (`public/samples/`). Vite serves `public/` at the site root, so the files end up at `/samples/A0.mp3`, `/samples/Ds1.mp3`, etc.
2. In `src/core/playback/toneEngine.ts`, change:
   ```ts
   const SALAMANDER_BASE = "https://tonejs.github.io/audio/salamander/";
   ```
   to:
   ```ts
   const SALAMANDER_BASE = "/samples/";
   ```
3. Re-run `npm run dev`. First playback should now be near-instant.

## Adding other instruments

If you build a new instrument preset that needs different samples, drop them into `public/samples/<preset>/` and create a parallel sampler in `toneEngine.ts` that loads from `/samples/<preset>/`. The `_preset` argument on `playEvents` is reserved for this — currently ignored.

## Licensing

Salamander Grand Piano samples are CC-licensed by Alexander Holm. Verify the current license at https://archive.org/details/SalamanderGrandPianoV3 before redistributing them inside a hosted build.
