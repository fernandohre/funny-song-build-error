import * as assert from 'assert';
import { CommandClassifier } from '../../classifier';
import { Logger } from '../../logger';

const noopLogger = { log: () => {}, info: () => {}, warn: () => {}, error: () => {}, show: () => {}, dispose: () => {} } as unknown as Logger;

suite('CommandClassifier', () => {
    let classifier: CommandClassifier;

    setup(() => {
        classifier = new CommandClassifier(noopLogger);
    });

    suite('default matchers', () => {
        test('matches npm run dev', () => {
            assert.strictEqual(classifier.isWatchedCommand('npm run dev', []), true);
        });

        test('matches npm run build', () => {
            assert.strictEqual(classifier.isWatchedCommand('npm run build', []), true);
        });

        test('matches pnpm dev', () => {
            assert.strictEqual(classifier.isWatchedCommand('pnpm dev', []), true);
        });

        test('matches pnpm build', () => {
            assert.strictEqual(classifier.isWatchedCommand('pnpm build', []), true);
        });

        test('matches yarn dev', () => {
            assert.strictEqual(classifier.isWatchedCommand('yarn dev', []), true);
        });

        test('matches yarn build', () => {
            assert.strictEqual(classifier.isWatchedCommand('yarn build', []), true);
        });

        test('matches vite', () => {
            assert.strictEqual(classifier.isWatchedCommand('vite', []), true);
        });

        test('matches next dev', () => {
            assert.strictEqual(classifier.isWatchedCommand('next dev', []), true);
        });

        test('matches next build', () => {
            assert.strictEqual(classifier.isWatchedCommand('next build', []), true);
        });

        test('matches react-scripts start', () => {
            assert.strictEqual(classifier.isWatchedCommand('react-scripts start', []), true);
        });

        test('matches react-scripts build', () => {
            assert.strictEqual(classifier.isWatchedCommand('react-scripts build', []), true);
        });

        test('matches command containing a default matcher as substring', () => {
            assert.strictEqual(classifier.isWatchedCommand('/usr/bin/env npm run dev --port 3000', []), true);
        });

        test('trims leading/trailing whitespace before matching', () => {
            assert.strictEqual(classifier.isWatchedCommand('  npm run dev  ', []), true);
        });

        test('does not match an unrelated command', () => {
            assert.strictEqual(classifier.isWatchedCommand('ls -la', []), false);
        });

        test('does not match empty string', () => {
            assert.strictEqual(classifier.isWatchedCommand('', []), false);
        });
    });

    suite('custom matchers', () => {
        test('uses custom matchers when provided, ignoring defaults', () => {
            assert.strictEqual(classifier.isWatchedCommand('my-custom-watch', ['my-custom-watch']), true);
        });

        test('default matcher does not apply when custom matchers are set', () => {
            assert.strictEqual(classifier.isWatchedCommand('npm run dev', ['my-custom-watch']), false);
        });

        test('does not match when command misses all custom matchers', () => {
            assert.strictEqual(classifier.isWatchedCommand('ls', ['my-custom-watch']), false);
        });
    });
});
