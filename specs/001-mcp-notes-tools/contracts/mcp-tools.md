# MCP Tool Contracts: MCP Notes Tools

These contracts define the local MCP tools exposed by the Obsidian plugin.
All tools operate only on the active project-specific vault.

## Common Response Rules

- Successful responses include `title` and `path` for every note reference.
- `path` is always vault-relative.
- Errors use a stable `code` and human-readable `message`.
- Errors must not include unrelated note content.
- Attachments, binaries, and plugin configuration files are out of scope.

## Error Codes

| Code | Meaning |
|------|---------|
| `invalid_input` | The request is missing required fields or includes invalid values. |
| `not_found` | The requested note cannot be found in the active vault. |
| `ambiguous_target` | The target cannot be resolved to exactly one note. |
| `not_note` | The target is not a markdown note document. |
| `confirmation_declined` | The user declined an append confirmation. |
| `read_failed` | The selected note could not be read. |
| `write_failed` | The selected note could not be updated. |

## Tool: `obsidian_search_notes`

Search notes by title, vault-relative path, and note body content.

**Input schema**:

```json
{
  "type": "object",
  "required": ["query"],
  "additionalProperties": false,
  "properties": {
    "query": {
      "type": "string",
      "minLength": 1,
      "description": "Text to match against note title, vault-relative path, or body content."
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 50,
      "default": 10,
      "description": "Maximum number of results to return."
    }
  }
}
```

**Success output**:

```json
{
  "results": [
    {
      "title": "Project Plan",
      "path": "Projects/Example/Project Plan.md",
      "snippet": "Relevant bounded context from the match...",
      "matchedFields": ["title", "body"]
    }
  ]
}
```

**Errors**: `invalid_input`, `read_failed`.

## Tool: `obsidian_get_note`

Return the full current content for one selected markdown note.

**Input schema**:

```json
{
  "type": "object",
  "required": ["path"],
  "additionalProperties": false,
  "properties": {
    "path": {
      "type": "string",
      "minLength": 1,
      "description": "Vault-relative markdown note path returned by search."
    },
    "title": {
      "type": "string",
      "description": "Optional expected note title used as an additional safety check."
    }
  }
}
```

**Success output**:

```json
{
  "title": "Project Plan",
  "path": "Projects/Example/Project Plan.md",
  "content": "# Project Plan\n\n..."
}
```

**Errors**: `invalid_input`, `not_found`, `ambiguous_target`, `not_note`,
`read_failed`.

## Tool: `obsidian_append_change_note`

Append a confirmed change note under a dedicated `Change notes` section with a
timestamp.

**Input schema**:

```json
{
  "type": "object",
  "required": ["path", "text"],
  "additionalProperties": false,
  "properties": {
    "path": {
      "type": "string",
      "minLength": 1,
      "description": "Vault-relative markdown note path returned by search or get-note."
    },
    "title": {
      "type": "string",
      "description": "Optional expected note title shown during confirmation."
    },
    "text": {
      "type": "string",
      "minLength": 1,
      "description": "Change note text to append after user confirmation."
    }
  }
}
```

**Confirmation requirement**:

Before writing, the plugin displays the target title, target path, timestamp, and
append text. The note is changed only if the user confirms.

**Success output**:

```json
{
  "status": "appended",
  "title": "Project Plan",
  "path": "Projects/Example/Project Plan.md",
  "timestamp": "2026-07-03T12:00:00+03:30"
}
```

**Declined output**:

```json
{
  "status": "declined",
  "title": "Project Plan",
  "path": "Projects/Example/Project Plan.md"
}
```

**Errors**: `invalid_input`, `not_found`, `ambiguous_target`, `not_note`,
`confirmation_declined`, `write_failed`.
