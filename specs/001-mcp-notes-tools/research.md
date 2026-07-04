# Research: MCP Notes Tools

## Decision: Use the official MCP TypeScript SDK for tool registration

**Rationale**: The official MCP TypeScript SDK supports named tool registration
with descriptions, input schemas, and asynchronous handlers. It also supports
local transports suitable for MCP clients. Using the official SDK keeps the
plugin aligned with current MCP client expectations and avoids inventing a
custom protocol surface.

**Alternatives considered**:

- Hand-roll a JSON message protocol: rejected because MCP compatibility would be
  fragile and tool schemas would need custom validation.
- Use an existing Obsidian REST plugin as the integration boundary: rejected
  because this feature must expose MCP tools from this plugin, not require a
  separate user-installed bridge.

## Decision: Prefer local Streamable HTTP for the plugin-owned MCP server

**Rationale**: The clarified scope says the Obsidian plugin owns the local MCP
tool boundary. A local HTTP MCP endpoint is easier for external MCP clients to
connect to while Obsidian is running than a stdio server embedded inside the
plugin process. It also gives the plugin a clear lifecycle: start on enable,
stop on unload, and expose connection details in settings.

**Alternatives considered**:

- Stdio transport: rejected for v1 because stdio is natural for standalone MCP
  server processes, not for an already-running Obsidian plugin.
- External hosted MCP server: rejected by clarification and privacy rules.

## Decision: Treat MCP serving as desktop-only for v1

**Rationale**: Local MCP serving requires runtime capabilities that are available
in Obsidian desktop but not reliably available on Obsidian mobile. The
constitution allows desktop-only behavior when the manifest discloses it.

**Alternatives considered**:

- Keep mobile support for all features: rejected because mobile cannot provide a
  local MCP server boundary for external MCP clients.
- Split mobile read-only mode into v1: rejected because it would not satisfy the
  feature's MCP serving requirement and would add a second validation target.

## Decision: Use vault-relative path plus title for note identity

**Rationale**: The user clarified that foldering/path and title are both
important, and the vault is project-specific. Returning both values makes search
results and append confirmations inspectable and prevents ambiguous title-only
matches.

**Alternatives considered**:

- Opaque generated IDs: rejected because they hide the project folder context
  users need for confidence.
- Title-only targeting: rejected because duplicate titles are common and unsafe
  for write operations.

## Decision: Search title, vault-relative path, and note body

**Rationale**: This matches the clarified user intent and supports both project
folder discovery and document content discovery. Search results will return
bounded snippets to avoid exposing unrelated note content.

**Alternatives considered**:

- Body-only search: rejected because it ignores project folder/title context.
- Title/path-only search: rejected because it cannot find notes by content.

## Decision: Append under `Change notes` with timestamp after confirmation

**Rationale**: A dedicated section makes assistant-written additions auditable
and keeps existing note prose intact. Per-write confirmation prevents silent MCP
writes to private vault content.

**Alternatives considered**:

- Append raw text at EOF: rejected because it can blur user-authored and
  assistant-authored content.
- Let the MCP client choose arbitrary insertion locations: rejected for v1
  because it broadens write risk and complicates confirmation UX.

## Decision: Use Obsidian vault APIs for note reads and writes

**Rationale**: Obsidian's vault APIs provide plugin-native file listing, reading,
and modifying inside the active vault. This keeps access scoped to the current
project-specific vault and avoids direct filesystem access outside Obsidian's
model.

**Alternatives considered**:

- Direct filesystem traversal: rejected because it risks bypassing Obsidian's
  vault abstraction and mobile/desktop differences.
- Cached full-vault index at startup: rejected because startup must remain
  light; search can lazily scan/cache when invoked.
