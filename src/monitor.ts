import * as vscode from 'vscode';
import { FaaaaahConfig, getConfig } from './config';
import { CommandClassifier } from './classifier';
import { OutputMatcher } from './matcher';
import { ErrorSessionState } from './session';
import { SoundPlayer } from './player';
import { Logger } from './logger';

/**
 * Listens to VS Code terminal shell execution events and drives the error
 * detection pipeline: classifier → output reader → matcher → session → player.
 */
export class TerminalMonitor {
    private readonly disposables: vscode.Disposable[] = [];

    constructor(
        private readonly classifier: CommandClassifier,
        private readonly matcher: OutputMatcher,
        private readonly session: ErrorSessionState,
        private readonly player: SoundPlayer,
        private readonly logger: Logger,
    ) {}

    start(): void {
        this.disposables.push(
            vscode.window.onDidStartTerminalShellExecution(e => this.onStart(e)),
            vscode.window.onDidEndTerminalShellExecution(e => this.onEnd(e)),
        );
        this.logger.info('Terminal monitor started');
    }

    private onStart(e: vscode.TerminalShellExecutionStartEvent): void {
        const config = getConfig();

        if (!config.enabled) {
            this.logger.log('Extension disabled, skipping terminal monitoring');
            return;
        }

        const command = e.execution.commandLine.value;

        if (!this.classifier.isWatchedCommand(command, config.commandMatchers)) {
            return;
        }

        const terminalId = e.terminal.name;
        this.session.clearSession(terminalId);
        this.logger.info(`Watching output for terminal "${terminalId}", command: "${command}"`);

        void this.readOutput(e.execution, terminalId, config);
    }

    private async readOutput(
        execution: vscode.TerminalShellExecution,
        terminalId: string,
        config: FaaaaahConfig,
    ): Promise<void> {
        try {
            for await (const chunk of execution.read()) {
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (this.matcher.matchesError(line, config.errorMatchers)) {
                        if (this.session.shouldTrigger(terminalId, config.cooldownMs)) {
                            this.logger.info(`Error detected in terminal "${terminalId}", playing sound`);
                            this.player.play(config.volume);
                        }
                    }
                }
            }
        } catch (err) {
            this.logger.error(`Error reading terminal output for "${terminalId}": ${err}`);
        }
    }

    private onEnd(e: vscode.TerminalShellExecutionEndEvent): void {
        const command = e.execution.commandLine.value;
        const exitCode = e.exitCode;
        this.logger.log(`Shell execution ended: "${command}" (exit code: ${exitCode ?? 'unknown'})`);
    }

    dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;
    }
}
