import { App, normalizePath, TFile } from 'obsidian';
import { McpToolError } from '../mcp/errors';
import type { AppendResult, DocumentContent, VaultNote } from '../types';

const CHANGE_NOTES_HEADING = '## Change notes';

export function listMarkdownNotes(app: App): TFile[] {
	return app.vault.getMarkdownFiles();
}

export async function readVaultNote(app: App, file: TFile): Promise<VaultNote> {
	try {
		return {
			title: file.basename,
			path: file.path,
			body: await app.vault.read(file),
			extension: file.extension,
		};
	} catch {
		throw new McpToolError('read_failed');
	}
}

export function resolveMarkdownNote(
	app: App,
	path: string,
	expectedTitle?: string,
): TFile {
	const normalizedPath = normalizePath(path);
	const abstractFile = app.vault.getAbstractFileByPath(normalizedPath);

	if (!abstractFile) {
		throw new McpToolError('not_found');
	}

	if (!(abstractFile instanceof TFile) || abstractFile.extension !== 'md') {
		throw new McpToolError('not_note');
	}

	if (expectedTitle && abstractFile.basename !== expectedTitle) {
		throw new McpToolError(
			'ambiguous_target',
			`Expected title "${expectedTitle}" does not match "${abstractFile.basename}".`,
		);
	}

	return abstractFile;
}

export async function getDocumentContent(
	app: App,
	path: string,
	expectedTitle?: string,
): Promise<DocumentContent> {
	const file = resolveMarkdownNote(app, path, expectedTitle);
	const note = await readVaultNote(app, file);

	return {
		title: note.title,
		path: note.path,
		content: note.body,
	};
}

export function formatChangeNoteEntry(text: string, timestamp: string): string {
	const trimmed = text.trim();
	if (!trimmed) {
		throw new McpToolError('invalid_input', 'Append text cannot be empty.');
	}

	const indented = trimmed
		.split(/\r?\n/)
		.map((line, index) => (index === 0 ? line : `  ${line}`))
		.join('\n');

	return `- ${timestamp}: ${indented}`;
}

export function appendChangeNoteToContent(
	content: string,
	text: string,
	timestamp: string,
): string {
	const entry = formatChangeNoteEntry(text, timestamp);
	const normalizedContent = content.replace(/\s*$/, '');

	if (new RegExp(`^${escapeRegExp(CHANGE_NOTES_HEADING)}\\s*$`, 'm').test(content)) {
		return `${normalizedContent}\n${entry}\n`;
	}

	return `${normalizedContent}\n\n${CHANGE_NOTES_HEADING}\n\n${entry}\n`;
}

export async function appendChangeNote(
	app: App,
	path: string,
	text: string,
	timestamp: string,
	expectedTitle?: string,
): Promise<AppendResult> {
	const file = resolveMarkdownNote(app, path, expectedTitle);

	try {
		const content = await app.vault.read(file);
		const updatedContent = appendChangeNoteToContent(content, text, timestamp);
		await app.vault.modify(file, updatedContent);

		return {
			status: 'appended',
			title: file.basename,
			path: file.path,
			timestamp,
		};
	} catch (error) {
		if (error instanceof McpToolError) {
			throw error;
		}
		throw new McpToolError('write_failed');
	}
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
