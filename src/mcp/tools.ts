import type { App } from 'obsidian';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpToolError, createErrorResult, createJsonResult } from './errors';
import {
	appendChangeNoteInputSchema,
	appendChangeNoteInputShape,
	getNoteInputSchema,
	getNoteInputShape,
	searchNotesInputSchema,
	searchNotesInputShape,
} from './schemas';
import { MCP_TOOL_NAMES } from '../types';
import { formatTimestamp } from '../utils/time';
import { appendChangeNote, getDocumentContent, resolveMarkdownNote } from '../vault/notes';
import { searchNotes } from '../vault/search';
import { confirmAppend } from '../ui/confirm-append';

export function registerMcpTools(server: McpServer, app: App): void {
	server.registerTool(
		MCP_TOOL_NAMES.searchNotes,
		{
			title: 'Search Obsidian notes',
			description:
				'Search markdown notes by title, vault-relative path, and body content.',
			inputSchema: searchNotesInputShape,
		},
		async (input) => {
			try {
				const parsed = searchNotesInputSchema.parse(input);
				const results = await searchNotes(app, parsed.query, parsed.limit);
				return createJsonResult({ results });
			} catch (error) {
				return createErrorResult(error);
			}
		},
	);

	server.registerTool(
		MCP_TOOL_NAMES.getNote,
		{
			title: 'Get Obsidian note',
			description: 'Return the full current content for one selected markdown note.',
			inputSchema: getNoteInputShape,
		},
		async (input) => {
			try {
				const parsed = getNoteInputSchema.parse(input);
				const note = await getDocumentContent(app, parsed.path, parsed.title);
				return createJsonResult(note);
			} catch (error) {
				return createErrorResult(error);
			}
		},
	);

	server.registerTool(
		MCP_TOOL_NAMES.appendChangeNote,
		{
			title: 'Append Obsidian change note',
			description:
				'Append confirmed text under a Change notes section with a timestamp.',
			inputSchema: appendChangeNoteInputShape,
		},
		async (input) => {
			try {
				const parsed = appendChangeNoteInputSchema.parse(input);
				const timestamp = formatTimestamp();
				const file = resolveMarkdownNote(app, parsed.path, parsed.title);
				const confirmed = await confirmAppend(app, {
					title: file.basename,
					path: file.path,
					timestamp,
					text: parsed.text,
				});

				if (!confirmed) {
					return createJsonResult({
						status: 'declined',
						title: file.basename,
						path: file.path,
					});
				}

				const result = await appendChangeNote(
					app,
					file.path,
					parsed.text,
					timestamp,
					parsed.title,
				);
				return createJsonResult(result);
			} catch (error) {
				if (error instanceof McpToolError) {
					return createErrorResult(error);
				}
				return createErrorResult(error);
			}
		},
	);
}
