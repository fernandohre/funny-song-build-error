import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Logger } from './logger';

export class SoundPlayer {
    private readonly defaultSoundPath: string;
    private readonly logger: Logger;

    constructor(context: vscode.ExtensionContext, logger: Logger) {
        this.defaultSoundPath = context.asAbsolutePath(path.join('media', 'error.mp3'));
        this.logger = logger;
    }

    play(volume: number, soundPath?: string): void {
        const filePath = soundPath ?? this.defaultSoundPath;
        const platform = process.platform;

        try {
            if (platform === 'darwin') {
                this.playMac(filePath, volume);
            } else if (platform === 'linux') {
                this.playLinux(filePath, volume);
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

    private isWsl(): boolean {
        try {
            const version = fs.readFileSync('/proc/version', 'utf8');
            return /microsoft|wsl/i.test(version);
        } catch {
            return false;
        }
    }

    private playLinux(filePath: string, volume: number): void {
        if (this.isWsl()) {
            // WSL2: delegate to Windows PowerShell for audio
            this.playWindows(filePath, volume);
            return;
        }

        // Try paplay first (PulseAudio/PipeWire), fall back to aplay (ALSA)
        const child = cp.spawn('paplay', [filePath], { detached: true, stdio: 'ignore' });
        child.on('error', () => {
            this.logger.log(`paplay not found, falling back to aplay: ${filePath}`);
            const aplay = cp.spawn('aplay', [filePath], { detached: true, stdio: 'ignore' });
            aplay.on('error', (err) => this.logger.error(`aplay failed: ${err.message}`));
            aplay.unref();
        });
        child.unref();
        this.logger.log(`Playing sound via paplay: ${filePath}`);
    }

    private playWindows(filePath: string, volume?: number): void {
        // On WSL, convert the Linux path to a Windows path and use powershell.exe
        const isWsl = this.isWsl();
        let windowsPath = filePath;
        if (isWsl) {
            try {
                windowsPath = cp.execSync(`wslpath -w "${filePath}"`).toString().trim();
            } catch {
                this.logger.error('wslpath conversion failed; sound may not play');
            }
        }
        const escaped = windowsPath.replace(/'/g, "''");
        const vol = volume !== undefined ? Math.min(1, Math.max(0, volume)) : 1;
        // Use MediaPlayer (PresentationCore) — supports MP3 and volume control
        const script = `Add-Type -AssemblyName PresentationCore;$p=New-Object System.Windows.Media.MediaPlayer;$p.Open([uri]'${escaped}');$p.Volume=${vol};$p.Play();Start-Sleep -Milliseconds 3000`;
        const bin = isWsl ? 'powershell.exe' : 'powershell';
        cp.spawn(bin, ['-NoProfile', '-Command', script], { detached: true, stdio: 'ignore' }).unref();
        this.logger.log(`Playing sound via ${bin} SoundPlayer: ${windowsPath}`);
    }
}
