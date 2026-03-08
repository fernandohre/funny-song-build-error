import * as vscode from 'vscode';
import { Logger } from './logger';
import { SoundPlayer } from './player';
import { ErrorSessionState } from './session';
import { getConfig } from './config';

/**
 * Registers all Faaaaah extension commands and returns them as disposables.
 */
export function registerCommands(
    logger: Logger,
    player: SoundPlayer,
    session: ErrorSessionState,
): vscode.Disposable[] {
    return [
        vscode.commands.registerCommand('faaaaah.testSound', () => {
            const config = getConfig();
            logger.info('Test sound command triggered');
            player.play(config.volume);
        }),

        vscode.commands.registerCommand('faaaaah.enable', () => {
            void vscode.workspace
                .getConfiguration('faaaaah')
                .update('enabled', true, vscode.ConfigurationTarget.Global);
            logger.info('Faaaaah enabled');
            void vscode.window.showInformationMessage('Faaaaah: enabled');
        }),

        vscode.commands.registerCommand('faaaaah.disable', () => {
            void vscode.workspace
                .getConfiguration('faaaaah')
                .update('enabled', false, vscode.ConfigurationTarget.Global);
            logger.info('Faaaaah disabled');
            void vscode.window.showInformationMessage('Faaaaah: disabled');
        }),

        vscode.commands.registerCommand('faaaaah.showOutputLog', () => {
            logger.show();
        }),

        vscode.commands.registerCommand('faaaaah.resetSessionState', () => {
            session.clearAll();
            logger.info('Session state reset');
            void vscode.window.showInformationMessage('Faaaaah: session state reset');
        }),
    ];
}
