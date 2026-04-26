# AI Generation Placeholder

The MVP does not call an AI API.

Future flow:

```text
User request
-> AI generator
-> JSON candidate
-> local validator
-> progression library or temporary exercise
```

LLM output must never go directly into the progression library or playback layer. Parse it, validate it with local harmony rules, normalize ids and metadata, deduplicate it, and only then use or persist it.
