import * as assert from 'assert';
import { ErrorSessionState } from '../../session';
import { Logger } from '../../logger';

const noopLogger = { log: () => {}, info: () => {}, warn: () => {}, error: () => {}, show: () => {}, dispose: () => {} } as unknown as Logger;

suite('ErrorSessionState', () => {
    let state: ErrorSessionState;

    setup(() => {
        state = new ErrorSessionState(noopLogger);
    });

    suite('shouldTrigger', () => {
        test('returns true for a fresh terminal', () => {
            assert.strictEqual(state.shouldTrigger('term1', 5000), true);
        });

        test('returns false immediately after triggering (within cooldown)', () => {
            state.shouldTrigger('term1', 5000);
            assert.strictEqual(state.shouldTrigger('term1', 5000), false);
        });

        test('different terminals are independent', () => {
            state.shouldTrigger('term1', 5000);
            assert.strictEqual(state.shouldTrigger('term2', 5000), true);
        });

        test('returns true after cooldown expires', async () => {
            state.shouldTrigger('term1', 10);
            await new Promise(r => setTimeout(r, 20));
            assert.strictEqual(state.shouldTrigger('term1', 10), true);
        });

        test('zero cooldown always allows triggering', () => {
            state.shouldTrigger('term1', 0);
            assert.strictEqual(state.shouldTrigger('term1', 0), true);
        });
    });

    suite('clearSession', () => {
        test('allows triggering again after clearing', () => {
            state.shouldTrigger('term1', 5000);
            state.clearSession('term1');
            assert.strictEqual(state.shouldTrigger('term1', 5000), true);
        });

        test('clearing a non-existent session does not throw', () => {
            assert.doesNotThrow(() => state.clearSession('nonexistent'));
        });

        test('clearing one terminal does not affect another', () => {
            state.shouldTrigger('term1', 5000);
            state.shouldTrigger('term2', 5000);
            state.clearSession('term1');
            assert.strictEqual(state.shouldTrigger('term2', 5000), false);
        });
    });

    suite('clearAll', () => {
        test('allows triggering on all terminals after clearing all', () => {
            state.shouldTrigger('term1', 5000);
            state.shouldTrigger('term2', 5000);
            state.clearAll();
            assert.strictEqual(state.shouldTrigger('term1', 5000), true);
            assert.strictEqual(state.shouldTrigger('term2', 5000), true);
        });

        test('clearAll on empty state does not throw', () => {
            assert.doesNotThrow(() => state.clearAll());
        });
    });
});
