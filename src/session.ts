import { Logger } from './logger';

interface SessionEntry {
    lastTriggeredAt: number;
}

/**
 * Tracks per-terminal error session state with cooldown.
 * Prevents repeated sound triggers for the same persistent error burst.
 */
export class ErrorSessionState {
    private readonly sessions = new Map<string, SessionEntry>();

    constructor(private readonly logger: Logger) {}

    /**
     * Returns true if sound should play for this terminal (not in cooldown).
     * Records the trigger time when returning true.
     */
    shouldTrigger(terminalId: string, cooldownMs: number): boolean {
        const now = Date.now();
        const entry = this.sessions.get(terminalId);

        if (entry !== undefined) {
            const elapsed = now - entry.lastTriggeredAt;
            if (elapsed < cooldownMs) {
                this.logger.log(
                    `Session cooldown active for terminal "${terminalId}": ${elapsed}ms elapsed, ${cooldownMs}ms required`
                );
                return false;
            }
        }

        this.sessions.set(terminalId, { lastTriggeredAt: now });
        this.logger.log(`Session triggered for terminal "${terminalId}"`);
        return true;
    }

    /**
     * Clears session state for a specific terminal (e.g. when it closes or a new run starts).
     */
    clearSession(terminalId: string): void {
        if (this.sessions.delete(terminalId)) {
            this.logger.log(`Session cleared for terminal "${terminalId}"`);
        }
    }

    /**
     * Clears all session state (e.g. on faaaaah.resetSessionState command).
     */
    clearAll(): void {
        const count = this.sessions.size;
        this.sessions.clear();
        this.logger.log(`All sessions cleared (${count} entries removed)`);
    }
}
