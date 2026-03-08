import * as vscode from 'vscode';

export function activate(_context: vscode.ExtensionContext): void {
    // Extension activates on startup.
    // Components will be wired here in subsequent stories.
    console.log('Faaaaah extension activated.');
}

export function deactivate(): void {
    // Clean-up on deactivation.
    console.log('Faaaaah extension deactivated.');
}
