# Quickstart: MCP Notes Tools Validation

## Prerequisites

- Obsidian desktop with this plugin installed in a test vault.
- A project-specific test vault with at least several markdown notes.
- Node.js LTS and npm available for build validation.
- An MCP client that can connect to the plugin's local MCP endpoint after the
  feature is implemented.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the plugin:

   ```bash
   npm run build
   ```

3. Reload Obsidian desktop and enable the plugin in **Settings → Community plugins**.

4. In plugin settings, enable local MCP serving and note the local endpoint.
   Use `/mcp` as the canonical endpoint, or use
   `/vaults/<vault-slug>/mcp` when your client needs a project-vault label.
   The vault slug must match the current plugin setting.

## Test Vault Data

Create a project folder such as:

```text
Projects/Example/
├── Project Plan.md
├── Meeting Notes.md
└── Research/Architecture.md
```

Use distinct body text in each note and include at least one duplicated or
similar title in another folder to validate path disambiguation.

## Scenario 1: Search Notes

1. From the MCP client, call `obsidian_search_notes` with a query that appears in
   a note title.
2. Confirm the result includes title, vault-relative path, snippet, and
   `matchedFields`.
3. Repeat with a query that appears only in the folder path.
4. Repeat with a query that appears only in note body content.

**Expected outcome**: Matching notes are returned within the success criteria,
and every result includes both title and vault-relative path.

If you use a raw message editor, send a complete JSON-RPC request:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "obsidian_search_notes",
    "arguments": {
      "query": "project",
      "limit": 10
    }
  }
}
```

## Scenario 2: Get Selected Note

1. Choose a result path from Scenario 1.
2. Call `obsidian_get_note` with that vault-relative path.

**Expected outcome**: The response returns the selected note's title, path, and
full current content. It does not return content from similarly titled notes.

Raw JSON-RPC example:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "obsidian_get_note",
    "arguments": {
      "path": "Projects/Example/Project Plan.md"
    }
  }
}
```

## Scenario 3: Append Change Note

1. Call `obsidian_append_change_note` with a valid path and non-empty text.
2. Verify Obsidian shows a confirmation containing title, path, timestamp, and
   append text.
3. Confirm the append.
4. Reopen the note.

**Expected outcome**: Existing content before the appended section is unchanged.
The new text appears under `Change notes` with a timestamp.

Raw JSON-RPC example:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "obsidian_append_change_note",
    "arguments": {
      "path": "Projects/Example/Project Plan.md",
      "text": "Follow up on the architecture decision."
    }
  }
}
```

## Scenario 4: Decline Append

1. Call `obsidian_append_change_note` with a valid path and non-empty text.
2. Decline the confirmation.
3. Reopen the note.

**Expected outcome**: The note remains unchanged and the MCP response reports a
declined write.

## Scenario 5: Error Handling

Validate these requests:

- Empty search query.
- Missing note path.
- Non-markdown target.
- Empty append text.
- Ambiguous title if a client supplies only context that cannot resolve one note.

**Expected outcome**: Each request returns a clear error code from
[contracts/mcp-tools.md](./contracts/mcp-tools.md) and does not change vault
content.

## Required Checks

Run before marking the feature complete:

```bash
npm run lint
npm run build
```

Also verify `manifest.json` accurately declares desktop-only behavior if local
MCP serving requires desktop runtime APIs.
