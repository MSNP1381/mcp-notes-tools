# Implementation Plan: MCP Notes Tools

**Branch**: `001-mcp-notes-tools` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-mcp-notes-tools/spec.md`

## Summary

Build a local-first Obsidian plugin feature that exposes three MCP tools for a
project-specific vault: search notes, get a selected note document, and append a
confirmed change note. The technical approach is to keep plugin lifecycle code
minimal, add focused MCP/vault/confirmation modules, expose a local MCP server
from the desktop plugin runtime, and document tool contracts before task
generation.

## Technical Context

**Language/Version**: TypeScript 5.8.x with Node.js LTS build tooling; Obsidian
desktop plugin runtime for v1 MCP transport.

**Primary Dependencies**: Obsidian API types, esbuild, npm scripts, official MCP
TypeScript SDK, schema validation helper compatible with MCP tool schemas.

**Storage**: Project-specific Obsidian vault markdown files plus plugin settings
via Obsidian plugin data persistence.

**Testing**: `npm run lint`, `npm run build`, focused unit tests for vault/tool
logic when added, and manual Obsidian desktop validation using `quickstart.md`.

**Target Platform**: Obsidian desktop for v1 because the plugin-owned local MCP
server requires desktop runtime capabilities. Obsidian mobile remains out of
scope for MCP serving in this feature.

**Project Type**: Obsidian community plugin with local MCP-facing tools.

**Performance Goals**: Plugin startup performs no full-vault scan. Manual
validation over a 100-note project vault returns valid search summaries within 2
seconds for 95% of searches, and the full search/get/append workflow completes
without restarting Obsidian.

**Constraints**: Local-first vault access, no external services or hidden
telemetry, explicit per-write user confirmation, append-only writes under
`Change notes` with timestamp, no remote code execution.

**Scale/Scope**: Initial validation target is a project-specific vault with at
least 100 markdown notes. Search matches note title, vault-relative path, and
note body content; attachments, binaries, and plugin configuration files are out
of scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. Obsidian boundaries: PASS. `src/main.ts` will load settings, register
   commands/settings, and start/stop the MCP boundary only; feature logic moves
   to `src/mcp/`, `src/vault/`, `src/ui/`, and `src/utils/`.
2. MCP contracts: PASS. Contracts are generated under `contracts/` for search,
   get document, and append change note with schemas, outputs, and error cases.
3. Vault privacy: PASS. The design is local-only, sends no vault data to
   external services, and requires explicit confirmation before writes.
4. Testable delivery: PASS. The plan preserves independent user stories and
   quickstart scenarios for search, get document, and append.
5. Release discipline: PASS WITH JUSTIFICATION. v1 will need `manifest.json`
   reviewed for desktop-only behavior because local MCP serving is not mobile
   compatible. This is allowed by the constitution when desktop-only runtime
   capabilities are required and the manifest accurately discloses it.

## Project Structure

### Documentation (this feature)

```text
specs/001-mcp-notes-tools/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── mcp-tools.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── main.ts                 # Plugin lifecycle only
├── settings.ts             # Settings data, validation, settings tab
├── types.ts                # Shared domain/tool result types
├── commands/
│   └── index.ts            # User-facing Obsidian commands
├── mcp/
│   ├── server.ts           # Local MCP server lifecycle
│   ├── tools.ts            # Tool registration
│   ├── schemas.ts          # Tool input/output schemas
│   └── errors.ts           # MCP-safe error mapping
├── vault/
│   ├── notes.ts            # Note listing, resolving, reading, appending
│   └── search.ts           # Title/path/body search
├── ui/
│   └── confirm-append.ts   # Per-write confirmation modal
└── utils/
    └── time.ts             # Timestamp formatting

tests/
├── mcp/
├── vault/
└── unit/
```

**Structure Decision**: Use a single Obsidian plugin project. Keep
`src/main.ts` minimal and split MCP transport, tool contracts, vault operations,
confirmation UI, settings, and utility logic into focused modules.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Desktop-only v1 MCP serving | Local MCP clients need a local transport/server boundary that is not available in Obsidian mobile | Keeping `isDesktopOnly: false` would imply mobile support that cannot serve MCP tools safely |

## Phase 0: Research

Research output is captured in [research.md](./research.md). Decisions resolved:

- Use official MCP TypeScript SDK for the local tool boundary.
- Serve MCP locally from the plugin-owned desktop runtime, with Streamable HTTP
  preferred for local clients.
- Use Obsidian vault APIs for listing, reading, and modifying markdown files.
- Require per-write confirmation before append.
- Treat desktop-only as an explicit v1 release constraint.

## Phase 1: Design & Contracts

Design output is captured in:

- [data-model.md](./data-model.md)
- [contracts/mcp-tools.md](./contracts/mcp-tools.md)
- [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

1. Obsidian boundaries: PASS. Planned modules keep lifecycle code separate from
   MCP, vault, and UI logic.
2. MCP contracts: PASS. `contracts/mcp-tools.md` documents all three tools.
3. Vault privacy: PASS. Contracts and quickstart validate local-only reads and
   confirmed append-only writes.
4. Testable delivery: PASS. Quickstart covers each user story independently and
   the end-to-end workflow.
5. Release discipline: PASS WITH JUSTIFICATION. Tasks must update manifest and
   release docs to disclose desktop-only MCP serving before build validation.
