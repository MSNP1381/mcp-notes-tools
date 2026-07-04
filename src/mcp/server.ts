import type { App } from 'obsidian';
import {
	createServer,
	type IncomingMessage,
	type Server,
	type ServerResponse,
} from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerMcpTools } from './tools';

export interface LocalMcpServerStatus {
	running: boolean;
	port: number;
	endpoint: string;
	vaultEndpoint: string;
	vaultSlug: string;
}

export class LocalMcpServer {
	private httpServer: Server | null = null;

	constructor(
		private readonly app: App,
		private readonly getPort: () => number,
		private readonly getVaultSlug: () => string,
	) {}

	getStatus(): LocalMcpServerStatus {
		const port = this.getPort();
		const vaultSlug = this.getVaultSlug();
		return {
			running: this.httpServer !== null,
			port,
			endpoint: `http://127.0.0.1:${port}/mcp`,
			vaultEndpoint: `http://127.0.0.1:${port}/vaults/${encodeURIComponent(vaultSlug)}/mcp`,
			vaultSlug,
		};
	}

	async start(): Promise<LocalMcpServerStatus> {
		if (this.httpServer) {
			return this.getStatus();
		}

		const port = this.getPort();
		const httpServer = createServer((req, res) => {
			void this.handleRequest(req, res);
		});

		await new Promise<void>((resolve, reject) => {
			httpServer.once('error', reject);
			httpServer.listen(port, '127.0.0.1', () => {
				httpServer.off('error', reject);
				resolve();
			});
		});

		this.httpServer = httpServer;
		return this.getStatus();
	}

	async stop(): Promise<void> {
		const server = this.httpServer;
		if (!server) {
			return;
		}

		await new Promise<void>((resolve, reject) => {
			server.close((error) => {
				if (error) {
					reject(error);
					return;
				}
				resolve();
			});
		});
		this.httpServer = null;
	}

	private async handleRequest(
		req: IncomingMessage,
		res: ServerResponse,
	): Promise<void> {
			const route = this.resolveRoute(req.url);
			if (!route.accepted) {
				res.writeHead(route.status, { 'content-type': 'application/json' });
				res.end(JSON.stringify({ error: route.error }));
				return;
			}

			if (req.method !== 'POST') {
				res.writeHead(405, { 'content-type': 'application/json' });
				res.end(JSON.stringify({ error: 'method_not_allowed' }));
				return;
			}

			const mcpServer = this.createMcpServer();
			const transport = new StreamableHTTPServerTransport({
				sessionIdGenerator: undefined,
			});

			try {
				await mcpServer.connect(transport);
				await transport.handleRequest(req, res, await readJsonBody(req));
			} catch {
				if (!res.headersSent) {
					res.writeHead(500, { 'content-type': 'application/json' });
					res.end(
						JSON.stringify({
							jsonrpc: '2.0',
							error: {
								code: -32603,
								message: 'Internal server error',
							},
							id: null,
						}),
					);
				}
			} finally {
				void transport.close();
				void mcpServer.close();
			}
	}

	private createMcpServer(): McpServer {
		const server = new McpServer({
			name: 'mcp-notes-tools',
			version: '1.0.0',
		});
		registerMcpTools(server, this.app);
		return server;
	}

	private resolveRoute(url: string | undefined): RouteResolution {
		if (!url) {
			return { accepted: false, status: 404, error: 'not_found' };
		}

		const pathname = new URL(url, 'http://127.0.0.1').pathname;
		if (pathname === '/mcp') {
			return { accepted: true };
		}

		const match = pathname.match(/^\/vaults\/([^/]+)\/mcp$/);
		if (!match) {
			return { accepted: false, status: 404, error: 'not_found' };
		}

		const slugParam = match[1];
		if (!slugParam) {
			return { accepted: false, status: 404, error: 'not_found' };
		}

		const requestedSlug = decodeURIComponent(slugParam);
		if (requestedSlug !== this.getVaultSlug()) {
			return { accepted: false, status: 404, error: 'vault_not_served' };
		}

		return { accepted: true };
	}
}

type RouteResolution =
	| { accepted: true }
	| { accepted: false; status: 404; error: 'not_found' | 'vault_not_served' };

async function readJsonBody(req: NodeJS.ReadableStream): Promise<unknown> {
	const chunks: Buffer[] = [];

	for await (const chunk of req) {
		chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
	}

	if (chunks.length === 0) {
		return undefined;
	}

	return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
