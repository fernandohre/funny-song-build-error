import * as vscode from 'vscode';

export class Logger {
    private readonly channel: vscode.OutputChannel;

    constructor() {
        this.channel = vscode.window.createOutputChannel('faaaaah');
    }

    log(message: string): void {
        this.channel.appendLine(`[LOG]   ${message}`);
    }

    info(message: string): void {
        this.channel.appendLine(`[INFO]  ${message}`);
    }

    warn(message: string): void {
        this.channel.appendLine(`[WARN]  ${message}`);
    }

    error(message: string): void {
        this.channel.appendLine(`[ERROR] ${message}`);
    }

    show(): void {
        this.channel.show();
    }

    dispose(): void {
        this.channel.dispose();
    }
}
