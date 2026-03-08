import * as vscode from 'vscode';

export interface FaaaaahConfig {
    enabled: boolean;
    cooldownMs: number;
    commandMatchers: string[];
    errorMatchers: string[];
    volume: number;
}

export function getConfig(): FaaaaahConfig {
    const cfg = vscode.workspace.getConfiguration('faaaaah');
    return {
        enabled: cfg.get<boolean>('enabled', true),
        cooldownMs: cfg.get<number>('cooldownMs', 5000),
        commandMatchers: cfg.get<string[]>('commandMatchers', []),
        errorMatchers: cfg.get<string[]>('errorMatchers', []),
        volume: cfg.get<number>('volume', 1.0),
    };
}
