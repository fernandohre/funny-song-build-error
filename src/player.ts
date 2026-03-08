import * as cp from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';
import { Logger } from './logger';

export class SoundPlayer {
    private readonly defaultSoundPath: string;
    private readonly logger: Logger;

    constructor(context: vscode.ExtensionContext, logger: Logger) {
        this.defaultSoundPath = context.asAbsolutePath(path.join('media', 'error.wav'));
        this.logger = logger;
    }

    play(volume: number, soundPath?: string): void {
        const filePath = soundPath ?? this.defaultSoundPath;
        const platform = process.platform;

        try {
            if (platform === 'darwin') {
                this.playMac(filePath, volume);
            } else if (platform === 'linux') {
                this.playLinux(filePath);
            } else if (platform === 'win32') {
                this.playWindows(filePath);
            } else {
                this.logger.warn(`Unsupported platform for sound playback: ${platform}`);
            }
        } catch (err) {
            this.logger.error(`Sound playback failed: ${err}`);
        }
    }

    private playMac(filePath: string, volume: number): void {
        const vol = Math.min(1, Math.max(0, volume));
        cp.spawn('afplay', ['-v', String(vol), filePath], { detached: true, stdio: 'ignore' }).unref();
        this.logger.log(`Playing sound via afplay: ${filePath} (volume=${vol})`);
    }

    private playLinux(filePath: string): void {
        // Try paplay first (PulseAudio/PipeWire), fall back to aplay (ALSA)
        const child = cp.spawn('paplay', [filePath], { detached: true, stdio: 'ignore' });
        child.on('error', () => {
            this.logger.log(`paplay not found, falling back to aplay: ${filePath}`);
            cp.spawn('aplay', [filePath], { detached: true, stdio: 'ignore' }).unref();
        });
        child.unref();
        this.logger.log(`Playing sound via paplay: ${filePath}`);
    }

    private playWindows(filePath: string): void {
        const escaped = filePath.replace(/'/g, "''");
        const script = `(New-Object Media.SoundPlayer '${escaped}').PlaySync()`;
        cp.spawn('powershell', ['-NoProfile', '-Command', script], { detached: true, stdio: 'ignore' }).unref();
        this.logger.log(`Playing sound via PowerShell SoundPlayer: ${filePath}`);
    }
}
