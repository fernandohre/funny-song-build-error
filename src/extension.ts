import * as vscode from 'vscode';
import { Logger } from './logger';
import { SoundPlayer } from './player';
import { CommandClassifier } from './classifier';
import { OutputMatcher } from './matcher';
import { ErrorSessionState } from './session';
import { TerminalMonitor } from './monitor';
import { registerCommands } from './commands';

export function activate(context: vscode.ExtensionContext): void {
    const logger = new Logger();
    const player = new SoundPlayer(context, logger);
    const classifier = new CommandClassifier(logger);
    const matcher = new OutputMatcher(logger);
    const session = new ErrorSessionState(logger);

    const monitor = new TerminalMonitor(classifier, matcher, session, player, logger);
    monitor.start();

    const commandDisposables = registerCommands(logger, player, session);

    context.subscriptions.push(
        logger,
        monitor,
        ...commandDisposables,
    );

    logger.info('Faaaaah extension activated.');
}

export function deactivate(): void {
    // VS Code disposes context.subscriptions automatically.
}
