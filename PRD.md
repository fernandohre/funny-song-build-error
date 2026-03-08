# PRD — Funny Song on Build Error

## Overview
Faaaaah is a desktop VS Code extension that plays a dramatic sound when a watched React build or dev command in the integrated terminal produces an error.

## Problem
Developers often miss terminal build failures while focused on the browser, code editor, or another monitor.

## Goal
Provide immediate audible feedback when a React dev/build command fails or emits known error output.

## Users
- React developers using VS Code desktop
- Developers using npm, pnpm, or yarn in the integrated terminal

## MVP
- Listen to terminal shell execution start/end events
- Identify watched commands
- Read raw terminal output for watched commands
- Match output against configurable error patterns
- Trigger sound once per error burst
- Support commands:
  - Test Sound
  - Enable
  - Disable
  - Show Output Log
- Support settings:
  - enabled
  - cooldownMs
  - commandMatchers
  - errorMatchers
  - volume

## Requirements
1. The extension must work on VS Code desktop.
2. The extension must rely on stable publishable APIs only.
3. The extension must support supported shells with VS Code shell integration.
4. The extension must trigger on:
   - matched error output
   - or failed command exit code
5. The extension must avoid repeated triggers for the same persistent error session.
6. The extension must log trigger reasons and skipped cases.
7. The extension must expose a manual Test Sound command.

## Out of Scope
- Custom user-uploaded sound
- Web extension support
- Parsing terminals outside VS Code
- Full framework coverage beyond React-oriented commands
- Marketplace polish beyond basic publishing assets

## Risks
- Shell integration support differs by shell/platform
- Long-running dev servers may emit repeated errors
- Audio playback can vary by OS

## Success Criteria
- `npm run dev` error in a React app triggers sound
- `npm run build` failure triggers sound
- No alert spam for repeated identical output
- Works on macOS, Windows, and Linux with supported shells
- Can be packaged as VSIX and later published