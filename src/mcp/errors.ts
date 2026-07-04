import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { McpErrorCode } from '../types';

const ERROR_MESSAGES: Record<McpErrorCode, string> = {
	invalid_input: 'The request is missing required fields or includes invalid values.',
	not_found: 'The requested note cannot be found in the active vault.',
	ambiguous_target: 'The target cannot be resolved to exactly one note.',
	not_note: 'The target is not a markdown note document.',
	confirmation_declined: 'The user declined the append confirmation.',
	read_failed: 'The selected note could not be read.',
	write_failed: 'The selected note could not be updated.',
};

export class McpToolError extends Error {
	constructor(
		public readonly code: McpErrorCode,
		message = ERROR_MESSAGES[code],
	) {
		super(message);
		this.name = 'McpToolError';
	}
}

export function toMcpError(error: unknown): McpToolError {
	if (error instanceof McpToolError) {
		return error;
	}

	if (error instanceof Error) {
		return new McpToolError('invalid_input', error.message);
	}

	return new McpToolError('invalid_input');
}

export function createErrorResult(error: unknown): CallToolResult {
	const toolError = toMcpError(error);

	return {
		isError: true,
		content: [
			{
				type: 'text',
				text: JSON.stringify(
					{
						error: {
							code: toolError.code,
							message: toolError.message,
						},
					},
					null,
					2,
				),
			},
		],
	};
}

export function createJsonResult(payload: unknown): CallToolResult {
	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify(payload, null, 2),
			},
		],
	};
}
