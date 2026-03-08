import * as assert from 'assert';
import { OutputMatcher } from '../../matcher';
import { Logger } from '../../logger';

const noopLogger = { log: () => {}, info: () => {}, warn: () => {}, error: () => {}, show: () => {}, dispose: () => {} } as unknown as Logger;

suite('OutputMatcher', () => {
    let matcher: OutputMatcher;

    setup(() => {
        matcher = new OutputMatcher(noopLogger);
    });

    suite('default matchers', () => {
        const errorLines: [string, string][] = [
            ['error TS2345: Argument of type', 'error TS'],
            ['SyntaxError: Unexpected token', 'SyntaxError'],
            ['TypeError: Cannot read properties of undefined', 'TypeError'],
            ['ReferenceError: foo is not defined', 'ReferenceError'],
            ['Failed to compile.', 'Failed to compile'],
            ['Module not found: Error: Can\'t resolve \'./missing\'', 'Module not found'],
            ['Build failed with errors.', 'Build failed'],
            ['[vite] error while updating dependencies', '[vite] error'],
            ['[ error ] ./pages/index.tsx', '[ error ]'],
            ['Error: something went wrong', 'Error:'],
            ['npm ERR! code ELIFECYCLE', 'npm ERR!'],
            ['pnpm ERR! code ELIFECYCLE', 'pnpm ERR!'],
        ];

        for (const [line, pattern] of errorLines) {
            test(`matches "${pattern}"`, () => {
                assert.strictEqual(matcher.matchesError(line, []), true);
            });
        }

        test('does not match a clean build line', () => {
            assert.strictEqual(matcher.matchesError('webpack compiled successfully', []), false);
        });

        test('does not match an empty line', () => {
            assert.strictEqual(matcher.matchesError('', []), false);
        });

        test('does not match unrelated output', () => {
            assert.strictEqual(matcher.matchesError('Starting development server...', []), false);
        });
    });

    suite('custom matchers', () => {
        test('uses custom matchers when provided, ignoring defaults', () => {
            assert.strictEqual(matcher.matchesError('CUSTOM_FAILURE detected', ['CUSTOM_FAILURE']), true);
        });

        test('default matcher does not apply when custom matchers are set', () => {
            assert.strictEqual(matcher.matchesError('error TS2345', ['CUSTOM_FAILURE']), false);
        });

        test('does not match when line misses all custom matchers', () => {
            assert.strictEqual(matcher.matchesError('all good', ['CUSTOM_FAILURE']), false);
        });
    });
});
