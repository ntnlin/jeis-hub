# Hermes Agent integration

Hermes Agent is wired as a bounded external specialist, not as the main memory
or storage layer for Jei's Hub.

## What Hermes is for

Use Hermes for tasks that benefit from tool orchestration:

- research
- repo/source audit
- competitive scan
- web search with synthesis
- one-off deep investigation

Keep Jei's Hub internal flows for:

- tweet/reply/content generation
- BD outreach drafts
- project strategy modules
- account/project-specific data writes
- skill learning and archive decisions

## Runtime boundary

The bridge lives in `src/core/hermesBridge.js` and is configured by
`config/hermes-agent.config.json`.

Key guardrails:

- Hermes runs through `hermes chat -Q --query ...`
- max tool turns default to `8`
- timeout defaults to `180s`
- prompt input and output are capped
- duplicate request outputs are cached for 15 minutes
- result content is hashed through the existing `Deduplicator`
- Hermes state is isolated in `.hermes-runtime/`
- file mutation is disabled by default
- Hermes user config/rules are ignored by default to avoid duplicated memory

## CLI usage

From Jei's Hub:

```bash
npm start
```

Then:

```text
/hermes audit this repo for weak data flow
/research latest competitors for Vezta on Solana prediction markets
```

## First-time Hermes install

Hermes must be installed on the machine before the bridge can run.

On Windows native PowerShell, Hermes currently documents native Windows support
as early beta. The more stable path is WSL2, but native PowerShell can work.

```powershell
iex (irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1)
```

After install, run:

```powershell
hermes doctor
hermes model
```

Then return to this project and use `/hermes` or `/research`.

## Tuning

To make Hermes cheaper/faster, edit `config/hermes-agent.config.json`:

- lower `maxTurns`
- lower `maxInputChars`
- lower `maxOutputChars`
- keep toolsets narrow, usually `["web", "search", "file"]`
- keep `disableHermesMemoryByDefault: true`

Only set `allowFileMutation: true` after adding a review/approval layer.
