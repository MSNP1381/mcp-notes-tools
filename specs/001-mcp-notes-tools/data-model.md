# Data Model: MCP Notes Tools

## MCP Capability

Represents one local tool exposed to MCP clients.

**Fields**:

- `name`: Stable tool identifier.
- `description`: Human-readable tool purpose.
- `inputSchema`: Validation schema for tool input.
- `outputShape`: Documented successful response shape.
- `errorCodes`: Documented failure responses.
- `vaultPermission`: Read or confirmed append access required.

**Validation rules**:

- Names are stable once released.
- Inputs are validated before vault access.
- Errors never include unrelated note content.

**Relationships**:

- Uses `Vault note` for search/get/append operations.
- Returns `Search result`, `Document content`, or `Append confirmation`.

## Vault Note

Represents a markdown note in the active project-specific vault.

**Fields**:

- `title`: Human-readable note title.
- `path`: Vault-relative markdown path.
- `body`: Current markdown content.
- `extension`: File extension, limited to markdown note documents.

**Validation rules**:

- Target notes must resolve inside the active vault.
- Target notes must be markdown documents.
- Path and title are returned together in results and confirmations.

**Relationships**:

- Produces zero or more `Search result` records.
- Produces one `Document content` when retrieved.
- Receives zero or more `Change note` appends.

## Search Result

Represents one matching note in a search response.

**Fields**:

- `title`: Note title.
- `path`: Vault-relative markdown path.
- `snippet`: Short context showing why the note matched.
- `matchedFields`: One or more of `title`, `path`, `body`.

**Validation rules**:

- Results include both title and path.
- Snippets are bounded and must not include unrelated full-note content.
- Empty searches return a validation error, not all notes.

**Relationships**:

- References one `Vault note`.
- Can be used as input context for get-document and append flows.

## Document Content

Represents the full content returned for a selected note.

**Fields**:

- `title`: Note title.
- `path`: Vault-relative markdown path.
- `content`: Full current markdown content.

**Validation rules**:

- Returned only for a resolved markdown note.
- Missing, ambiguous, or non-note targets return an error.

**Relationships**:

- References one `Vault note`.

## Change Note

Represents text appended to a selected note after confirmation.

**Fields**:

- `targetTitle`: Note title.
- `targetPath`: Vault-relative markdown path.
- `timestamp`: Timestamp included with the append.
- `text`: Non-empty append text.
- `status`: `pending_confirmation`, `declined`, `appended`, or `failed`.

**Validation rules**:

- Text must be non-empty after trimming whitespace.
- User confirmation is required before writing.
- Appended text is placed under a `Change notes` section with timestamp.
- Existing note content is preserved before the appended section.

**State transitions**:

```text
pending_confirmation -> declined
pending_confirmation -> appended
pending_confirmation -> failed
```

## Plugin Settings

Represents user-visible plugin configuration and disclosures.

**Fields**:

- `mcpEnabled`: Whether local MCP serving is enabled.
- `mcpPort`: Local MCP port or automatic port preference.
- `appendRequiresConfirmation`: Always true for this feature.
- `privacyDisclosureAccepted`: Whether the user has seen local vault access disclosure.

**Validation rules**:

- Write confirmation cannot be disabled in this feature.
- Settings describe local vault access and desktop-only MCP serving.
