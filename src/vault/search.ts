import { App } from 'obsidian';
import { McpToolError } from '../mcp/errors';
import type { MatchedField, SearchResult, VaultNote } from '../types';
import { listMarkdownNotes, readVaultNote } from './notes';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const SNIPPET_RADIUS = 80;

export async function searchNotes(
	app: App,
	query: string,
	limit = DEFAULT_LIMIT,
): Promise<SearchResult[]> {
	const normalizedQuery = query.trim().toLowerCase();
	if (!normalizedQuery) {
		throw new McpToolError('invalid_input', 'Search query cannot be empty.');
	}

	const boundedLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
	const results: SearchResult[] = [];

	for (const file of listMarkdownNotes(app)) {
		const note = await readVaultNote(app, file);
		const matchedFields = getMatchedFields(note, normalizedQuery);

		if (matchedFields.length === 0) {
			continue;
		}

		results.push({
			title: note.title,
			path: note.path,
			snippet: buildSnippet(note, normalizedQuery, matchedFields),
			matchedFields,
		});

		if (results.length >= boundedLimit) {
			break;
		}
	}

	return results;
}

function getMatchedFields(note: VaultNote, query: string): MatchedField[] {
	const fields: Array<[MatchedField, string]> = [
		['title', note.title],
		['path', note.path],
		['body', note.body],
	];

	return fields
		.filter(([, value]) => value.toLowerCase().includes(query))
		.map(([field]) => field);
}

function buildSnippet(
	note: VaultNote,
	query: string,
	matchedFields: MatchedField[],
): string {
	if (matchedFields.includes('body')) {
		return snippetAround(note.body, query);
	}

	if (matchedFields.includes('title')) {
		return note.title;
	}

	return note.path;
}

function snippetAround(content: string, query: string): string {
	const normalizedContent = content.replace(/\s+/g, ' ').trim();
	const index = normalizedContent.toLowerCase().indexOf(query);

	if (index === -1) {
		return normalizedContent.slice(0, SNIPPET_RADIUS * 2);
	}

	const start = Math.max(index - SNIPPET_RADIUS, 0);
	const end = Math.min(index + query.length + SNIPPET_RADIUS, normalizedContent.length);
	const prefix = start > 0 ? '...' : '';
	const suffix = end < normalizedContent.length ? '...' : '';

	return `${prefix}${normalizedContent.slice(start, end)}${suffix}`;
}
