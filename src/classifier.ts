import { Logger } from './logger';

const DEFAULT_COMMAND_MATCHERS: string[] = [
    'npm run dev',
    'npm run build',
    'pnpm dev',
    'pnpm build',
    'yarn dev',
    'yarn build',
    'vite',
    'next dev',
    'next build',
    'react-scripts start',
    'react-scripts build',
];

export class CommandClassifier {
    constructor(private readonly logger: Logger) {}

    isWatchedCommand(command: string, customMatchers: string[]): boolean {
        const matchers = customMatchers.length > 0 ? customMatchers : DEFAULT_COMMAND_MATCHERS;
        const trimmed = command.trim();

        for (const matcher of matchers) {
            if (trimmed.includes(matcher)) {
                this.logger.log(`Command matched: "${matcher}" in "${trimmed}"`);
                return true;
            }
        }

        this.logger.log(`Command not watched: "${trimmed}"`);
        return false;
    }
}
