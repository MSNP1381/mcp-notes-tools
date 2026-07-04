import { App, PluginSettingTab, Setting } from 'obsidian';
import type McpNotesPlugin from './main';
import type { McpNotesSettings } from './types';
import { normalizeVaultSlug } from './utils/vault-slug';

export const DEFAULT_SETTINGS: McpNotesSettings = {
	mcpEnabled: true,
	mcpPort: 39399,
	vaultSlug: '',
	appendRequiresConfirmation: true,
	privacyDisclosureAccepted: false,
};

export function normalizeSettings(
	data: Partial<McpNotesSettings> | null,
	vaultName: string,
): McpNotesSettings {
	return {
		...DEFAULT_SETTINGS,
		...data,
		appendRequiresConfirmation: true,
		mcpPort: normalizePort(data?.mcpPort ?? DEFAULT_SETTINGS.mcpPort),
		vaultSlug: normalizeVaultSlug(data?.vaultSlug ?? vaultName),
	};
}

export class McpNotesSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		private readonly plugin: McpNotesPlugin,
	) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		const status = this.plugin.localMcpServer.getStatus();

		containerEl.empty();
		new Setting(containerEl).setName('Local mcp server').setHeading();

		new Setting(containerEl)
			.setName('Enable local mcp server')
			.setDesc('Expose local mcp tools for this desktop Obsidian vault.')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.mcpEnabled)
					.onChange(async (value) => {
						this.plugin.settings.mcpEnabled = value;
						await this.plugin.saveSettings();
						await this.plugin.syncMcpServer();
						this.display();
					}),
			);

		new Setting(containerEl)
			.setName('Local mcp endpoint')
			.setDesc(status.running ? status.endpoint : 'MCP server is disabled.');

		new Setting(containerEl)
			.setName('Vault-specific mcp endpoint')
			.setDesc(status.running ? status.vaultEndpoint : 'MCP server is disabled.');

		new Setting(containerEl)
			.setName('Local mcp port')
			.setDesc('Restart the local mcp server after changing this value.')
			.addText((text) =>
				text
					.setPlaceholder(String(DEFAULT_SETTINGS.mcpPort))
					.setValue(String(this.plugin.settings.mcpPort))
					.onChange(async (value) => {
						this.plugin.settings.mcpPort = normalizePort(Number(value));
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Vault URL slug')
			.setDesc('Only this slug is accepted in the vault-specific endpoint.')
			.addText((text) =>
				text
					.setPlaceholder(normalizeVaultSlug(this.app.vault.getName()))
					.setValue(this.plugin.settings.vaultSlug)
					.onChange(async (value) => {
						this.plugin.settings.vaultSlug = normalizeVaultSlug(value);
						await this.plugin.saveSettings();
						this.display();
					}),
			);

		new Setting(containerEl)
			.setName('Append confirmation')
			.setDesc('Every append request requires confirmation. This cannot be disabled.');

		new Setting(containerEl)
			.setName('Privacy disclosure')
			.setDesc(
				'All mcp tools operate locally on this project vault. No note content is sent to external services by this plugin.',
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.privacyDisclosureAccepted)
					.onChange(async (value) => {
						this.plugin.settings.privacyDisclosureAccepted = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}

function normalizePort(value: number): number {
	if (!Number.isInteger(value) || value < 1024 || value > 65535) {
		return DEFAULT_SETTINGS.mcpPort;
	}
	return value;
}
