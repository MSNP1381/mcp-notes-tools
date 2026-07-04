export const MCP_TOOL_NAMES = {
	searchNotes: 'obsidian_search_notes',
	getNote: 'obsidian_get_note',
	appendChangeNote: 'obsidian_append_change_note',
} as const;

export type McpToolName = (typeof MCP_TOOL_NAMES)[keyof typeof MCP_TOOL_NAMES];

export type McpErrorCode =
	| 'invalid_input'
	| 'not_found'
	| 'ambiguous_target'
	| 'not_note'
	| 'confirmation_declined'
	| 'read_failed'
	| 'write_failed';

export interface McpNotesSettings {
	mcpEnabled: boolean;
	mcpPort: number;
	vaultSlug: string;
	appendRequiresConfirmation: true;
	privacyDisclosureAccepted: boolean;
}

export interface VaultNote {
	title: string;
	path: string;
	body: string;
	extension: string;
}

export type MatchedField = 'title' | 'path' | 'body';

export interface SearchResult {
	title: string;
	path: string;
	snippet: string;
	matchedFields: MatchedField[];
}

export interface DocumentContent {
	title: string;
	path: string;
	content: string;
}

export type ChangeNoteStatus =
	| 'pending_confirmation'
	| 'declined'
	| 'appended'
	| 'failed';

export interface ChangeNote {
	targetTitle: string;
	targetPath: string;
	timestamp: string;
	text: string;
	status: ChangeNoteStatus;
}

export interface AppendConfirmationRequest {
	title: string;
	path: string;
	timestamp: string;
	text: string;
}

export interface AppendResult {
	status: 'appended' | 'declined';
	title: string;
	path: string;
	timestamp?: string;
}
