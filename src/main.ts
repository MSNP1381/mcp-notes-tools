import { Notice, Plugin } from 'obsidian';
import { registerCommands } from './commands';
import { LocalMcpServer } from './mcp/server';
import {
	DEFAULT_SETTINGS,
	McpNotesSettingTab,
	normalizeSettings,
} from './settings';
import type { McpNotesSettings } from './types';

export default class McpNotesPlugin extends Plugin {
	settings!: McpNotesSettings;
	localMcpServer!: LocalMcpServer;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.localMcpServer = new LocalMcpServer(
			this.app,
			() => this.settings.mcpPort,
			() => this.settings.vaultSlug,
		);

		this.addSettingTab(new McpNotesSettingTab(this.app, this));
		registerCommands(this, this.localMcpServer);
		await this.syncMcpServer();
	}

	onunload(): void {
		void this.localMcpServer?.stop();
	}

	async loadSettings(): Promise<void> {
		this.settings = normalizeSettings(
			(await this.loadData()) as Partial<McpNotesSettings> | null,
			this.app.vault.getName(),
		);
	}

	async saveSettings(): Promise<void> {
		this.settings = {
			...this.settings,
			appendRequiresConfirmation: DEFAULT_SETTINGS.appendRequiresConfirmation,
		};
		await this.saveData(this.settings);
	}

	async syncMcpServer(): Promise<void> {
		try {
			if (this.settings.mcpEnabled) {
				const status = await this.localMcpServer.start();
				new Notice(`MCP Notes Tools listening at ${status.endpoint}`);
				return;
			}

			await this.localMcpServer.stop();
		} catch (error) {
			new Notice('Failed to start mcp notes tools server.');
			console.error(error);
		}
	}
}
