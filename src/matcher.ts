import { Logger } from './logger';

const DEFAULT_ERROR_MATCHERS: string[] = [
    // Generic build/compile errors
    'error TS',
    'SyntaxError',
    'TypeError',
    'ReferenceError',
    // React / JSX
    'Failed to compile',
    'Module not found',
    // Vite
    'Build failed',
    '[vite] error',
    // Next.js
    '[ error ]',
    'Error:',
    // ESLint / general
    'npm ERR!',
    'pnpm ERR!',
];

export class OutputMatcher {
    constructor(private readonly logger: Logger) {}

    matchesError(line: string, customMatchers: string[]): boolean {
        const matchers = customMatchers.length > 0 ? customMatchers : DEFAULT_ERROR_MATCHERS;

        for (const pattern of matchers) {
            if (line.includes(pattern)) {
                this.logger.log(`Error matched: "${pattern}" in output line`);
                return true;
            }
        }

        return false;
    }
}
