import { App, ButtonComponent, Modal, Setting } from 'obsidian';
import type { AppendConfirmationRequest } from '../types';

export function confirmAppend(
	app: App,
	request: AppendConfirmationRequest,
): Promise<boolean> {
	return new Promise((resolve) => {
		new AppendConfirmationModal(app, request, resolve).open();
	});
}

class AppendConfirmationModal extends Modal {
	private resolved = false;

	constructor(
		app: App,
		private readonly request: AppendConfirmationRequest,
		private readonly resolve: (confirmed: boolean) => void,
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl('h2', { text: 'Confirm change note append' });
		contentEl.createEl('p', {
			text: 'Review the target note and text before changing the vault.',
		});

		new Setting(contentEl).setName('Title').setDesc(this.request.title);
		new Setting(contentEl).setName('Path').setDesc(this.request.path);
		new Setting(contentEl).setName('Timestamp').setDesc(this.request.timestamp);

		contentEl.createEl('h3', { text: 'Text to append' });
		contentEl.createEl('pre', { text: this.request.text });

		new Setting(contentEl)
			.addButton((button: ButtonComponent) => {
				button
					.setButtonText('Decline')
					.onClick(() => this.finish(false));
			})
			.addButton((button: ButtonComponent) => {
				button
					.setButtonText('Append')
					.setCta()
					.onClick(() => this.finish(true));
			});
	}

	onClose(): void {
		this.contentEl.empty();
		if (!this.resolved) {
			this.finish(false);
		}
	}

	private finish(confirmed: boolean): void {
		if (this.resolved) {
			return;
		}

		this.resolved = true;
		this.resolve(confirmed);
		this.close();
	}
}
