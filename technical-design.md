# Technical Design Doc — Faaaaah VS Code Extension

## 1. Overview

**Faaaaah** is a desktop VS Code extension that plays a sound effect when a watched React build/dev command running in the **integrated terminal** emits an error.

This document describes the technical design for **v1**, focusing on a strong, publishable foundation:
- terminal-first detection
- cross-platform support
- stable VS Code APIs only
- clear separation of concerns
- easy future extension for custom sounds and additional frameworks

---

## 2. Goals

### Primary goals
- Detect build/dev failures from **integrated terminal output**
- Support common React workflows:
  - `npm run dev`
  - `npm run build`
  - `pnpm dev`
  - `pnpm build`
  - `yarn dev`
  - `yarn build`
  - `vite`
  - `next dev`
  - `next build`
  - `react-scripts start`
  - `react-scripts build`
- Play a bundled default sound once per failure burst
- Avoid repeated sound spam for the same persistent error
- Work on Windows, macOS, and Linux
- Remain publishable to the VS Code Marketplace

### Secondary goals
- Provide useful logs for debugging
- Keep architecture modular for:
  - custom sounds later
  - more command matchers later
  - more framework support later

---

## 3. Non-Goals

For v1, the extension will **not**:
- support web extensions
- parse external terminals outside VS Code
- support user-uploaded custom sounds
- support every build tool/framework
- rely on proposed VS Code APIs
- implement AI-based terminal classification
- provide rich UI beyond commands, settings, and log output

---

## 4. Product Scope

### In scope
- VS Code desktop extension
- Terminal shell execution monitoring
- Raw output matching for watched commands
- Exit-code-based fallback failure detection
- Configurable command/error matchers
- Output channel logs
- Commands:
  - `Faaaaah: Test Sound`
  - `Faaaaah: Enable`
  - `Faaaaah: Disable`
  - `Faaaaah: Show Output Log`
  - `Faaaaah: Reset Session State`

### Out of scope
- Marketplace assets polish beyond basics
- telemetry
- cloud sync
- user accounts
- workspace collaboration features

---

## 5. High-Level Architecture

The extension will follow a layered architecture:

```text
VS Code API Layer
  ├── activation / commands
  ├── terminal shell execution events
  └── configuration / output channel

Application Layer
  ├── terminal monitor
  ├── command classifier
  ├── output matcher
  ├── error session state
  └── trigger coordinator

Infrastructure Layer
  ├── sound player
  ├── logger
  └── configuration reader