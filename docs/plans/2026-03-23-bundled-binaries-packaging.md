# Bundled Binary Packaging Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure packaged builds always include bundled `uv` (and Windows `node.exe`) while preferring China-friendly mirrors during local development downloads.

**Architecture:** Add a shared build-time helper that decides which binaries to prepare for each packaging target and which download URLs to try in mirror-first or official-first order. Wire all packaging entry scripts through a single preparation command so `electron-builder` always sees populated `resources/bin/<platform>-<arch>` directories before copying `extraResources`.

**Tech Stack:** Node.js, zx scripts, pnpm scripts, Vitest

---

### Task 1: Lock behavior with tests

**Files:**
- Create: `tests/unit/bundled-binaries.test.ts`

**Step 1: Write the failing test**

Cover:
- package/build/release scripts invoke bundled binary preparation
- mac/linux prepare `uv`
- Windows prepare both `uv` and `node`
- local/dev downloads prefer mirrors while CI prefers official URLs first

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/bundled-binaries.test.ts`
Expected: FAIL because the helper module and updated package scripts do not exist yet.

### Task 2: Implement shared binary preparation helpers

**Files:**
- Create: `scripts/bundled-binary-config.mjs`
- Create: `scripts/prepare-bundled-binaries.mjs`
- Modify: `scripts/download-bundled-uv.mjs`
- Modify: `scripts/download-bundled-node.mjs`

**Step 1: Write minimal implementation**

Add:
- mirror preference helpers with env overrides
- URL fallback lists for `uv` and `node`
- target resolution for `mac`, `linux`, `win`, `current`, `all`
- a preparation script that runs the right downloads for the selected target

**Step 2: Run targeted test to verify it passes**

Run: `pnpm test tests/unit/bundled-binaries.test.ts`
Expected: PASS

### Task 3: Wire packaging entry points

**Files:**
- Modify: `package.json`

**Step 1: Update scripts**

Add dedicated `prepare:binaries*` scripts and make `build`, `package`, `package:*`, `release`, and `init` route through them where appropriate.

**Step 2: Run targeted test to verify it stays green**

Run: `pnpm test tests/unit/bundled-binaries.test.ts`
Expected: PASS

### Task 4: Sync docs

**Files:**
- Modify: `README.md`
- Modify: `README.zh-CN.md`
- Modify: `README.ja-JP.md`

**Step 1: Document new behavior**

Explain that packaging commands now auto-prepare bundled binaries and that local development prefers mirror endpoints with official fallback.

**Step 2: Run final targeted verification**

Run: `pnpm test tests/unit/bundled-binaries.test.ts`
Expected: PASS
