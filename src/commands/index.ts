import { Notice, type Plugin } from 'obsidian';
import type { LocalMcpServer } from '../mcp/server';

export function registerCommands(
	plugin: Plugin,
	localMcpServer: LocalMcpServer,
): void {
	plugin.addCommand({
		id: 'show-mcp-endpoint',
		name: 'Show mcp endpoint',
		callback: () => {
			const status = localMcpServer.getStatus();
			new Notice(
				status.running
					? `MCP endpoint: ${status.vaultEndpoint}`
					: 'MCP server is disabled.',
			);
		},
	});
}
