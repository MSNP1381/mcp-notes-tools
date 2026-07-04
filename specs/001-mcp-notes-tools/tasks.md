# Tasks: MCP Notes Tools

**Input**: Design documents from `/specs/001-mcp-notes-tools/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/mcp-tools.md, quickstart.md

**Tests**: Automated test tasks are not included because the feature specification does not request TDD. Validation tasks use the documented manual MCP/Obsidian quickstart plus lint/build checks.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes an exact file path

## Path Conventions

- Plugin source lives under `src/`
- Feature docs live under `specs/001-mcp-notes-tools/`
- MCP tool contracts are documented in `specs/001-mcp-notes-tools/contracts/mcp-tools.md`
- Generated `main.js` is produced by `npm run build`; do not edit it manually

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies, metadata, and source directories for the MCP feature.

- [X] T001 Add official MCP TypeScript SDK and schema validation dependency entries in package.json
- [X] T002 Update manifest.json to declare desktop-only behavior and MCP notes plugin metadata for local MCP serving
- [X] T003 Update versions.json to keep plugin version mapping aligned with manifest.json
- [X] T004 [P] Create MCP source directory and placeholder barrel in src/mcp/index.ts
- [X] T005 [P] Create vault source directory and placeholder barrel in src/vault/index.ts
- [X] T006 [P] Create UI source directory and placeholder barrel in src/ui/index.ts
- [X] T007 [P] Create commands source directory and placeholder barrel in src/commands/index.ts
- [X] T008 [P] Create shared utilities directory and placeholder barrel in src/utils/index.ts
- [X] T009 Create shared domain type exports for MCP capabilities, vault notes, search results, document content, change notes, and plugin settings in src/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T010 Replace sample settings with MCP settings defaults and validation in src/settings.ts
- [X] T011 Implement settings UI for enabling local MCP serving, showing endpoint details, and disclosing desktop-only local vault access in src/settings.ts
- [X] T012 Implement stable MCP error code mapping from contracts/mcp-tools.md in src/mcp/errors.ts
- [X] T013 Implement MCP input and output schemas for obsidian_search_notes, obsidian_get_note, and obsidian_append_change_note in src/mcp/schemas.ts
- [X] T014 Implement local MCP server lifecycle skeleton with start, stop, and status handling in src/mcp/server.ts
- [X] T015 Implement MCP tool registration skeleton for all three contracted tools in src/mcp/tools.ts
- [X] T016 Implement timestamp formatting helper for Change notes entries in src/utils/time.ts
- [X] T017 Refactor src/main.ts to remove sample ribbon, modal, click, and interval behavior while keeping loadSettings, settings tab registration, and unload cleanup
- [X] T018 Wire MCP server lifecycle into plugin load/unload without adding vault search/read/write logic to src/main.ts
- [X] T019 Document local-only MCP behavior, desktop-only scope, no hidden telemetry, and confirmed append writes in README.md

**Checkpoint**: Foundation ready; user story implementation can begin.

---

## Phase 3: User Story 1 - Search vault notes (Priority: P1) MVP

**Goal**: MCP clients can search the active project-specific vault by note title, vault-relative path, and note body content.

**Independent Test**: Create a test vault with several notes, call `obsidian_search_notes`, and confirm matching results include title, vault-relative path, matched fields, and bounded snippets without exposing unrelated full-note content.

### Implementation for User Story 1

- [X] T020 [P] [US1] Implement markdown note listing for the active project-specific vault in src/vault/notes.ts
- [X] T021 [P] [US1] Implement bounded snippet generation and matchedFields calculation in src/vault/search.ts
- [X] T022 [US1] Implement title, vault-relative path, and body content search with limit handling in src/vault/search.ts
- [X] T023 [US1] Implement obsidian_search_notes tool handler using vault search and MCP-safe errors in src/mcp/tools.ts
- [X] T024 [US1] Register obsidian_search_notes schema and handler in the local MCP server in src/mcp/server.ts
- [X] T025 [US1] Add empty-query and read-failed error handling for search in src/mcp/errors.ts
- [X] T026 [US1] Document search validation steps and expected fields against quickstart Scenario 1 in specs/001-mcp-notes-tools/quickstart.md

**Checkpoint**: User Story 1 is independently functional and validates the MVP search workflow.

---

## Phase 4: User Story 2 - Get a selected note document (Priority: P2)

**Goal**: MCP clients can retrieve the full current content of one selected markdown note by vault-relative path, with title/path safety context.

**Independent Test**: Choose a search result path, call `obsidian_get_note`, and confirm the returned content belongs only to that note and includes title plus vault-relative path.

### Implementation for User Story 2

- [X] T027 [P] [US2] Implement note target resolution by vault-relative path and optional expected title in src/vault/notes.ts
- [X] T028 [P] [US2] Implement markdown-note validation that rejects missing, ambiguous, and non-note targets in src/vault/notes.ts
- [X] T029 [US2] Implement safe note reading that returns title, vault-relative path, and full current content in src/vault/notes.ts
- [X] T030 [US2] Implement obsidian_get_note tool handler using note resolution and read errors in src/mcp/tools.ts
- [X] T031 [US2] Register obsidian_get_note schema and handler in the local MCP server in src/mcp/server.ts
- [X] T032 [US2] Add not_found, ambiguous_target, not_note, and read_failed mapping for get-note flows in src/mcp/errors.ts
- [X] T033 [US2] Document get-note validation steps and similarly titled note safety checks in specs/001-mcp-notes-tools/quickstart.md

**Checkpoint**: User Stories 1 and 2 work independently and together for search-to-read workflows.

---

## Phase 5: User Story 3 - Append a change note (Priority: P3)

**Goal**: MCP clients can request an append-only change note, the user confirms each write, and the plugin appends under `Change notes` with a timestamp.

**Independent Test**: Start with a known note, call `obsidian_append_change_note`, confirm the modal, and verify existing content is preserved before the appended `Change notes` section; repeat with declined confirmation and empty input.

### Implementation for User Story 3

- [X] T034 [P] [US3] Implement append text validation and Change notes section formatter in src/vault/notes.ts
- [X] T035 [P] [US3] Implement confirmation modal showing title, vault-relative path, timestamp, and append text in src/ui/confirm-append.ts
- [X] T036 [US3] Implement append operation that preserves existing content and writes timestamped text under Change notes in src/vault/notes.ts
- [X] T037 [US3] Implement obsidian_append_change_note tool handler with pending, declined, appended, and failed outcomes in src/mcp/tools.ts
- [X] T038 [US3] Register obsidian_append_change_note schema and handler in the local MCP server in src/mcp/server.ts
- [X] T039 [US3] Add invalid_input, confirmation_declined, and write_failed mapping for append flows in src/mcp/errors.ts
- [X] T040 [US3] Ensure src/settings.ts makes append confirmation mandatory and impossible to disable for this feature
- [X] T041 [US3] Document append confirmation, declined append, and unchanged-content checks in specs/001-mcp-notes-tools/quickstart.md

**Checkpoint**: All three user stories are independently functional and support the complete search, get-document, append workflow.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation, validation, and release-readiness checks across all user stories.

- [X] T042 Update README.md with MCP tool names, local endpoint setup, search/get/append examples, and privacy disclosure
- [X] T043 Verify contracts/mcp-tools.md matches implemented tool names, schemas, output fields, and error codes in specs/001-mcp-notes-tools/contracts/mcp-tools.md
- [X] T044 Run npm run lint and fix any lint errors in src/
- [X] T045 Run npm run build and confirm main.js is generated from current TypeScript source
- [ ] T046 Validate quickstart Scenario 1 search behavior in specs/001-mcp-notes-tools/quickstart.md
- [ ] T047 Validate quickstart Scenario 2 get-note behavior in specs/001-mcp-notes-tools/quickstart.md
- [ ] T048 Validate quickstart Scenarios 3 and 4 append confirmation and declined-write behavior in specs/001-mcp-notes-tools/quickstart.md
- [ ] T049 Validate quickstart Scenario 5 error handling in specs/001-mcp-notes-tools/quickstart.md
- [X] T050 Verify manifest.json, package.json, and versions.json version and desktop-only release metadata are aligned

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; delivers MVP search.
- **User Story 2 (Phase 4)**: Depends on Foundational; can be implemented after or alongside US1, but validation uses a search result path.
- **User Story 3 (Phase 5)**: Depends on Foundational and reuses note resolution from US2.
- **Polish (Phase 6)**: Depends on all selected user stories.

### User Story Dependencies

- **US1 Search vault notes**: No dependency on other stories after foundation.
- **US2 Get selected note document**: Uses note identity conventions shared with US1; can be implemented independently after foundation.
- **US3 Append a change note**: Depends on note resolution and confirmation infrastructure; safest after US2.

### Within Each User Story

- Vault helpers before MCP tool handlers.
- Schemas and error mapping before MCP server registration.
- Core implementation before quickstart validation updates.
- Complete and validate a story before relying on it in later story validation.

### Parallel Opportunities

- T004, T005, T006, T007, and T008 can run in parallel after T001-T003 are understood.
- T020 and T021 can run in parallel for US1.
- T027 and T028 can run in parallel for US2.
- T034 and T035 can run in parallel for US3.
- T046, T047, T048, and T049 can run independently after implementation and build.

---

## Parallel Example: User Story 1

```bash
# Independent implementation work:
Task: "T020 [US1] Implement markdown note listing for the active project-specific vault in src/vault/notes.ts"
Task: "T021 [US1] Implement bounded snippet generation and matchedFields calculation in src/vault/search.ts"

# After both complete:
Task: "T022 [US1] Implement title, vault-relative path, and body content search with limit handling in src/vault/search.ts"
```

## Parallel Example: User Story 2

```bash
# Independent implementation work:
Task: "T027 [US2] Implement note target resolution by vault-relative path and optional expected title in src/vault/notes.ts"
Task: "T028 [US2] Implement markdown-note validation that rejects missing, ambiguous, and non-note targets in src/vault/notes.ts"
```

## Parallel Example: User Story 3

```bash
# Independent implementation work:
Task: "T034 [US3] Implement append text validation and Change notes section formatter in src/vault/notes.ts"
Task: "T035 [US3] Implement confirmation modal showing title, vault-relative path, timestamp, and append text in src/ui/confirm-append.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational MCP/settings/vault boundaries.
3. Complete Phase 3 search tasks.
4. Stop and validate search independently through quickstart Scenario 1.

### Incremental Delivery

1. Deliver US1 search so MCP clients can discover project notes.
2. Add US2 get-document so clients can retrieve selected note content.
3. Add US3 append so clients can request confirmed, append-only change notes.
4. Finish polish checks, release metadata, lint, build, and manual validation.

### Notes

- Tasks marked [P] touch different files or independent logic and can be done in parallel.
- User story labels map directly to spec user stories.
- `src/main.ts` must remain lifecycle-focused; do not place search/read/write logic there.
- Do not edit generated `main.js` manually; regenerate it with `npm run build`.
