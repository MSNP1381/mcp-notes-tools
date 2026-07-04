# Feature Specification: MCP Notes Tools

**Feature Branch**: `001-mcp-notes-tools`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "i want to build a obsidian plugin that it has the mcp for seach and get doc and also append some notes to change in it"

## Clarifications

### Session 2026-07-03

- Q: Where should the MCP server boundary live? → A: The Obsidian plugin exposes local MCP tools for search, get document, and append change note.
- Q: Should append writes require explicit user confirmation? → A: Require explicit user confirmation for each append before changing the note.
- Q: How should notes be identified across search, get document, and append? → A: Use both vault-relative path and title; the vault is project-specific.
- Q: How should appended change notes be formatted? → A: Append under a dedicated `Change notes` section with a timestamp.
- Q: What note fields should search match? → A: Search title, vault-relative path, and note body content.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search vault notes (Priority: P1)

A user connects an MCP-capable assistant to their vault and asks it to find
notes related to a topic. The assistant receives a concise list of matching
notes with both title and vault-relative path so the user can choose the right
document in the project-specific vault. Search considers note title,
vault-relative path, and note body content.

**Why this priority**: Search is the entry point for all later document reading
and note-changing workflows.

**Independent Test**: Create a vault with several notes, request a search for a
known term through the MCP client, and confirm the result list identifies the
expected matching notes without exposing unrelated note content.

**Acceptance Scenarios**:

1. **Given** a vault contains notes with a matching title, path, or body text,
   **When** the MCP client searches for that text, **Then** the user receives
   matching note identifiers, titles, vault-relative paths, and short snippets.
2. **Given** no note matches the search text, **When** the MCP client searches,
   **Then** the user receives an empty result with a clear no-match message.
3. **Given** multiple notes have similar names or titles, **When** search
   returns results, **Then** each result includes title and vault-relative path
   so the user can distinguish them.

---

### User Story 2 - Get a selected note document (Priority: P2)

After finding a note, a user asks the assistant to open the selected document so
the assistant can reason over the current content before suggesting changes.

**Why this priority**: Reading a chosen document is required before safe note
updates can be proposed or appended.

**Independent Test**: Select a note from search results, request the document
through the MCP client, and confirm the returned content belongs only to the
selected note.

**Acceptance Scenarios**:

1. **Given** a valid note identifier from search results, **When** the MCP
   client requests the document, **Then** the full current note content is
   returned with the note title and vault-relative path.
2. **Given** the requested note no longer exists, **When** the MCP client
   requests it, **Then** the user receives a not-found result and no fallback
   note content is returned.
3. **Given** the requested target is not a note document, **When** the MCP
   client requests it, **Then** the request is rejected with a clear reason.

---

### User Story 3 - Append a change note (Priority: P3)

After reviewing a document, a user asks the assistant to append a small change
note to the selected file. Existing note content remains intact, and the new
text is added only to the requested target under a dedicated `Change notes`
section with a timestamp.

**Why this priority**: Append-only updates provide the first safe write workflow
while minimizing risk to existing vault content.

**Independent Test**: Start with a known note, append a change note through the
MCP client, and confirm the original content is unchanged before the appended
section.

**Acceptance Scenarios**:

1. **Given** a valid note and append text, **When** the MCP client requests an
   append and the user confirms it, **Then** the text is added to the end of
   that note under a `Change notes` section with a timestamp and the user
   receives confirmation with the target note identity.
2. **Given** append text is empty or only whitespace, **When** the MCP client
   requests an append, **Then** the write is rejected and the note remains
   unchanged.
3. **Given** the user declines an append confirmation, **When** the MCP client
   requests an append, **Then** the note remains unchanged and the client
   receives a declined-write response.
4. **Given** the target note changed since it was last read, **When** the MCP
   client requests an append and the user confirms it, **Then** the append still
   preserves all existing content and reports the final note identity.

### Edge Cases

- The requested search query is empty or only whitespace.
- The vault contains many matching notes and results must be limited to a useful
  number.
- The MCP client requests a missing, renamed, or ambiguous note.
- The append request contains malformed text or text that appears to request a
  destructive overwrite.
- The vault is large enough that an unrestricted search would be slow.
- The target note cannot be read or written at the moment the request is made.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The plugin MUST expose a vault note search capability to MCP clients.
- **FR-001a**: MCP capabilities MUST be exposed locally by the Obsidian plugin
  rather than depending on an external hosted MCP service.
- **FR-002**: Search requests MUST accept a text query and return matching notes
  with note identity, title, vault-relative path, and a short relevant context
  snippet.
- **FR-002a**: Search matching MUST consider note title, vault-relative path,
  and note body content.
- **FR-003**: Search requests MUST return a clear empty-result response when no
  notes match.
- **FR-004**: The plugin MUST expose a document retrieval capability for a
  selected vault note.
- **FR-005**: Document retrieval MUST return only the requested note's current
  content, title, and vault-relative path.
- **FR-006**: Document retrieval MUST reject missing, non-note, or ambiguous
  targets without returning unrelated note content.
- **FR-007**: The plugin MUST expose an append capability for adding a change
  note to an existing vault note.
- **FR-008**: Append requests MUST require a target note and non-empty append
  text.
- **FR-009**: Append operations MUST require explicit user confirmation before
  changing a note.
- **FR-009a**: Append operations MUST preserve all existing note content and add
  only the requested append text after confirmation.
- **FR-009b**: Confirmed append operations MUST place the appended text under a
  dedicated `Change notes` section with a timestamp.
- **FR-010**: Write operations MUST be limited to explicit user-requested append
  actions inside the vault.
- **FR-011**: The plugin MUST provide clear error responses for invalid input,
  missing notes, ambiguous targets, unreadable notes, and failed writes.
- **FR-012**: The plugin MUST default to local vault operation and MUST NOT send
  note content, filenames, or metadata to external services without explicit
  user consent and documentation.
- **FR-013**: The plugin MUST provide user-visible settings or documentation
  that explain enabled MCP capabilities and their vault access behavior.
- **FR-014**: Each MCP capability MUST have a stable name, documented input,
  documented output, and documented error responses.
- **FR-015**: MCP requests that target a note MUST resolve the note within the
  active project-specific vault and preserve both note title and vault-relative
  path in responses and confirmations.

### Key Entities *(include if feature involves data)*

- **MCP capability**: A user-invoked action available to an MCP client, including
  search, document retrieval, and append change note.
- **Vault note**: A markdown note in the project-specific vault, identified by
  both title and vault-relative path.
- **Search result**: A compact representation of a matching note, including note
  identity, title, vault-relative path, and a short snippet.
- **Document content**: The current full content of a selected vault note plus
  title and vault-relative path.
- **Change note**: Non-empty text appended to the end of a selected vault note
  under a dedicated `Change notes` section with a timestamp at the user's
  request.
- **Plugin settings**: User-facing preferences and disclosures for MCP capability
  enablement and vault access behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can search a vault of at least 100 notes and identify a
  known matching note within 10 seconds.
- **SC-002**: 95% of valid searches over a 100-note vault return matching note
  summaries in under 2 seconds during manual validation.
- **SC-003**: A user can retrieve a selected note from search results and confirm
  it is the intended document on the first attempt in at least 9 out of 10 trials.
- **SC-004**: In validation, 100% of append operations preserve all pre-existing
  note content before the appended text.
- **SC-005**: Invalid, missing, ambiguous, and empty-input requests produce clear
  failure responses without changing vault content.
- **SC-006**: The complete search, get-document, and append workflow can be
  completed without restarting the note application.

## Assumptions

- The target user owns or controls the project-specific vault being accessed.
- The MCP integration boundary is local to the Obsidian plugin and the connected
  MCP client.
- The initial feature scope is limited to local vault search, local note
  retrieval, and append-only note changes.
- Appending a change note means adding text to the end of an existing note, not
  rewriting or inserting content elsewhere.
- Appended change notes use a dedicated `Change notes` section and include a
  timestamp.
- Each append request requires per-write user confirmation before the note is
  changed.
- Search results are limited to note documents and exclude binary files,
  attachments, and plugin configuration files.
- Search matching includes note title, vault-relative path, and note body
  content.
- External network services and hidden telemetry are out of scope for the
  initial feature.
- Mobile compatibility remains a goal unless later planning identifies an
  unavoidable desktop-only constraint.
