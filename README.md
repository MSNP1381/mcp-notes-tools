# MCP Notes Tools

MCP Notes Tools is an Obsidian desktop plugin that exposes local MCP tools for a
project-specific vault. It lets an MCP client search notes, read a selected note,
and request a confirmed append-only change note.

## Features

- `obsidian_search_notes`: searches note title, vault-relative path, and note
  body content.
- `obsidian_get_note`: returns the full current content for one selected
  markdown note.
- `obsidian_append_change_note`: asks for confirmation, then appends text under a
  `Change notes` section with a timestamp.

Every note reference includes both title and vault-relative path. Attachments,
binary files, and plugin configuration files are out of scope.

## Privacy and Safety

The plugin operates locally on the active Obsidian vault. It does not send note
content, filenames, metadata, or user identifiers to external services.

Append requests always require per-write confirmation in Obsidian before any
note is changed. Existing note content is preserved before the appended
`Change notes` entry.

## Desktop Only

This plugin is desktop-only because local MCP serving depends on desktop runtime
capabilities that are not available in Obsidian mobile.

## Local MCP Endpoint

Enable the local MCP server in **Settings -> MCP Notes Tools**. The settings tab
shows the endpoint, which defaults to:

```text
http://127.0.0.1:39399/mcp
```

Configure your MCP client to connect to that local endpoint while Obsidian is
running and the plugin is enabled.

The plugin also exposes a vault-specific alias for clients that need to
disambiguate project vaults:

```text
http://127.0.0.1:39399/vaults/<vault-slug>/mcp
```

The alias is only a routing label for the current Obsidian vault. A mismatched
slug is rejected; one plugin instance cannot query other vaults.

## Development

Install dependencies:

```bash
npm install
```

Run the development build:

```bash
npm run dev
```

Run validation checks:

```bash
npm run lint
npm run build
```

Reload Obsidian after changing `manifest.json`. Reload the plugin after source
changes so the generated `main.js` is loaded.

## Release Artifacts

Required release files:

- `manifest.json`
- `main.js`
- `styles.css` if styles are used

Do not edit `main.js` manually. Generate it with `npm run build`.
